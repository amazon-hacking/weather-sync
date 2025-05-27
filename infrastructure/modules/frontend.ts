import * as aws from "@pulumi/aws";
import * as command from "@pulumi/command";
import * as pulumi from "@pulumi/pulumi";

interface FrontendInfrastructureArgs {
  certificate: aws.acm.CertificateValidation;
  hostedZone: aws.route53.Zone;
}

export function createFrontendInfrastructure(args: FrontendInfrastructureArgs) {
  const { certificate, hostedZone } = args;

  // ==============================================
  // BUCKET S3 PARA FRONTEND
  // ==============================================
  const frontendBucket = new aws.s3.Bucket("weather-sync-frontend-bucket", {
    bucket: `weather-sync-frontend-${pulumi.getStack()}`,
  });

  // ==============================================
  // CONFIGURAÇÃO DE WEBSITE ESTÁTICO
  // ==============================================
  const frontendBucketWebsite = new aws.s3.BucketWebsiteConfigurationV2(
    "frontend-bucket-website",
    {
      bucket: frontendBucket.id,
      indexDocument: {
        suffix: "index.html",
      },
      errorDocument: {
        key: "index.html", // Para React Router funcionar
      },
    }
  );

  // ==============================================
  // ORIGIN ACCESS CONTROL
  // ==============================================
  const originAccessControl = new aws.cloudfront.OriginAccessControl(
    "frontend-oac",
    {
      name: "weather-sync-frontend-oac",
      description: "OAC for weather-sync frontend",
      originAccessControlOriginType: "s3",
      signingBehavior: "always",
      signingProtocol: "sigv4",
    }
  );

  // ==============================================
  // CLOUDFRONT DISTRIBUTION
  // ==============================================
  const distribution = new aws.cloudfront.Distribution(
    "frontend-distribution",
    {
      origins: [
        {
          domainName: frontendBucket.bucketDomainName,
          originId: "S3-frontend",
          originAccessControlId: originAccessControl.id,
        },
      ],
      enabled: true,
      isIpv6Enabled: true,
      defaultRootObject: "index.html",
      aliases: ["weather-sync.com.br"],
      defaultCacheBehavior: {
        allowedMethods: [
          "DELETE",
          "GET",
          "HEAD",
          "OPTIONS",
          "PATCH",
          "POST",
          "PUT",
        ],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: "S3-frontend",
        forwardedValues: {
          queryString: false,
          cookies: { forward: "none" },
        },
        viewerProtocolPolicy: "redirect-to-https",
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
        compress: true, // Importante para performance React
      },
      // Configuração para React Router (SPA)
      customErrorResponses: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: "/index.html",
          errorCachingMinTtl: 10,
        },
        {
          errorCode: 403,
          responseCode: 200,
          responsePagePath: "/index.html",
          errorCachingMinTtl: 10,
        },
      ],
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
      viewerCertificate: {
        acmCertificateArn: certificate.certificateArn,
        sslSupportMethod: "sni-only",
        minimumProtocolVersion: "TLSv1.2_2021",
      },
    }
  );

  // ==============================================
  // POLÍTICA DO BUCKET S3 (CORRIGIDA)
  // ==============================================
  const frontEndBucketPolicy = new aws.s3.BucketPolicy(
    "frontend-bucket-policy",
    {
      bucket: frontendBucket.id,
      policy: pulumi
        .all([frontendBucket.arn, distribution.id])
        .apply(([bucketArn, distributionId]) =>
          JSON.stringify({
            Version: "2012-10-17",
            Statement: [
              {
                Sid: "AllowCloudFrontServicePrincipal",
                Effect: "Allow",
                Principal: {
                  Service: "cloudfront.amazonaws.com",
                },
                Action: "s3:GetObject",
                Resource: `${bucketArn}/*`,
                Condition: {
                  StringEquals: {
                    "AWS:SourceArn": `arn:aws:cloudfront::${
                      aws.getCallerIdentityOutput().accountId
                    }:distribution/${distributionId}`,
                  },
                },
              },
            ],
          })
        ),
    },
    { dependsOn: [distribution] }
  );

  // ==============================================
  // DEPLOY AUTOMÁTICO DO REACT BUILD
  // ==============================================
  // Sync do build React para S3
  const deployReactToS3 = new command.local.Command(
    "deploy-react-to-s3",
    {
      create: pulumi.interpolate`aws s3 sync ../apps/website/dist/ s3://${frontendBucket.id}/ --delete`,
      update: pulumi.interpolate`aws s3 sync ../apps/website/dist/ s3://${frontendBucket.id}/ --delete`,
      // Força re-execução usando timestamp
      environment: {
        DEPLOY_TIMESTAMP: Date.now().toString(),
      },
    },
    {
      dependsOn: [frontEndBucketPolicy],
    }
  );

  // Invalidação automática do CloudFront
  const invalidateCloudFrontCache = new command.local.Command(
    "invalidate-cloudfront-cache",
    {
      create: pulumi.interpolate`aws cloudfront create-invalidation --distribution-id ${distribution.id} --paths "/*"`,
      update: pulumi.interpolate`aws cloudfront create-invalidation --distribution-id ${distribution.id} --paths "/*"`,
      environment: {
        INVALIDATE_TIMESTAMP: Date.now().toString(),
      },
    },
    {
      dependsOn: [deployReactToS3],
    }
  );

  // ==============================================
  // REGISTRO DNS PARA CLOUDFRONT
  // ==============================================
  const domainARecord = new aws.route53.Record("weather-sync-a-record", {
    zoneId: hostedZone.zoneId,
    name: "weather-sync.com.br",
    type: "A",
    aliases: [
      {
        name: distribution.domainName,
        zoneId: distribution.hostedZoneId,
        evaluateTargetHealth: false,
      },
    ],
  });

  return {
    frontendBucket,
    frontendBucketWebsite,
    originAccessControl,
    frontEndBucketPolicy,
    distribution,
    domainARecord,
    distributionId: distribution.id,
    deployReactToS3,
    invalidateCloudFrontCache,
  };
}
