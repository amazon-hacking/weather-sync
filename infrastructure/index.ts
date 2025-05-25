import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as docker from "@pulumi/docker-build";
import * as pulumi from "@pulumi/pulumi";
import { env } from "../apps/server/src/shared/env/env";

const config = new pulumi.Config();

// ==============================================
// CONFIGURAÇÕES DE EMAIL (SES)
// ==============================================

// Create a User IAM to access SES
const setUser = new aws.iam.User("weather-sync-ses-user");

const setUserPolicy = new aws.iam.UserPolicy("ses-user-policy", {
  user: setUser.name,
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:GetSendQuota",
          "ses:GetSendStatistics",
        ],
        Resource: "*",
      },
    ],
  }),
});

const sesAccessKey = new aws.iam.AccessKey("weather-sync-ses-access-key", {
  user: setUser.name,
});

const sesDomainIdentity = new aws.ses.DomainIdentity(
  "weather-sync-ses-domain",
  {
    domain: "weather-sync.com",
  }
);

const sesDomainDkim = new aws.ses.DomainDkim("weather-sync-ses-domain-dkim", {
  domain: sesDomainIdentity.domain,
});

// ==============================================
// CLOUDFRONT + S3 PARA FRONTEND
// ==============================================

const frontendBucket = new aws.s3.Bucket("weather-sync-frontend-bucket", {
  bucket: `weather-sync-frontend-${pulumi.getStack()}`,
  acl: "private",
});

// Bucket estático para o frontend
const frontEndBucketPolicy = new aws.s3.BucketPolicy("frontend-bucket-policy", {
  bucket: frontendBucket.id,
  policy: frontendBucket.arn.apply((bucketArn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: "*" },
          Action: "s3:GetObject",
          Resource: `${bucketArn}/*`,
          Condition: {
            StringEquals: {
              "AWS:SourceArn": `arn:aws:cloudfront::${
                aws.getCallerIdentityOutput().accountId
              }:distribution/*`,
            },
          },
        },
      ],
    })
  ),
});

// Origin Access Identity para CloudFront
const oai = new aws.cloudfront.OriginAccessIdentity("frontend-oai", {
  comment: "OAI for frontend bucket",
});

// CloudFront Distribution
const distribution = new aws.cloudfront.Distribution("frontend-distribution", {
  origins: [
    {
      domainName: frontendBucket.bucketDomainName,
      originId: "S3-frontend",
      s3OriginConfig: {
        originAccessIdentity: oai.cloudfrontAccessIdentityPath,
      },
    },
  ],
  enabled: true,
  isIpv6Enabled: true,
  defaultRootObject: "index.html",
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
  },
  customErrorResponses: [
    {
      errorCode: 404,
      responseCode: 200,
      responsePagePath: "/index.html",
    },
  ],
  restrictions: {
    geoRestriction: {
      restrictionType: "none",
    },
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
});

// ==============================================
// BACKEND (ECR + ECS)
// ==============================================

// Create a new ECR repository
const repository = new awsx.ecr.Repository("weather-sync-deploy-ecr-repo");
const { userName, password } = aws.ecr.getAuthorizationTokenOutput({
  registryId: repository.repository.registryId,
});

// Create a image from the Dockerfile in the current directory
const image = new docker.Image("deploy-weather-sync-docker-image", {
  context: {
    location: "../",
  },
  builder: {
    name: "orbstack",
  },
  platforms: ["linux/amd64"],
  push: true,
  registries: [
    {
      address: repository.repository.repositoryUrl,
      username: userName,
      password: password,
    },
  ],
  tags: [pulumi.interpolate`${repository.repository.repositoryUrl}:latest`],
});

const cluster = new awsx.classic.ecs.Cluster(
  "deploy-weather-sync-container-cluster"
);

const loadBalancer = new awsx.classic.lb.ApplicationLoadBalancer(
  "deploy-weather-sync-lb",
  {
    securityGroups: cluster.securityGroups,
  }
);

const targetGroup = loadBalancer.createTargetGroup("deploy-weather-sync-tg", {
  protocol: "HTTP",
  port: 80,
  healthCheck: {
    protocol: "HTTP",
    path: "/health-check",
    interval: 30,
    healthyThreshold: 3,
    unhealthyThreshold: 3,
    timeout: 5,
  },
});

const listener = loadBalancer.createListener("deploy-weather-sync-listener", {
  protocol: "HTTP",
  port: 3333,
  targetGroup,
});

const app = new awsx.classic.ecs.FargateService("deploy-ecs-app", {
  cluster,
  desiredCount: 1,
  waitForSteadyState: false,
  taskDefinitionArgs: {
    container: {
      image: image.ref,
      cpu: 256,
      memory: 512,
      portMappings: [listener],
      environment: [
        {
          name: "NODE_ENV",
          value: env.NODE_ENV,
        },
        {
          name: "DATABASE_URL",
          value: env.DATABASE_URL,
        },
        {
          name: "APP_PORT",
          value: env.APP_PORT.toString(),
        },
        {
          name: "JWT_SECRET",
          value: env.JWT_SECRET,
        },
        {
          name: "TWILIO_ACCOUNT_SID",
          value: env.TWILIO_ACCOUNT_SID,
        },
        {
          name: "TWILIO_AUTH_TOKEN",
          value: env.TWILIO_AUTH_TOKEN,
        },
        {
          name: "TWILIO_PHONE_NUMBER",
          value: env.TWILIO_PHONE_NUMBER,
        },
        {
          name: "TWILIO_TEMPLATE",
          value: env.TWILIO_TEMPLATE,
        },
        {
          name: "TWILIO_ACCOUNT",
          value: env.TWILIO_ACCOUNT,
        },
        {
          name: "ALLOWED_ORIGINS",
          value: env.ALLOWED_ORIGINS,
        },
      ],
    },
  },
});

const scalingTarget = new aws.appautoscaling.Target("deploy-as-target", {
  minCapacity: 1,
  maxCapacity: 5,
  serviceNamespace: "ecs",
  resourceId: pulumi.interpolate`service/${cluster.cluster.name}/${app.service.name}`,
  scalableDimension: "ecs:service:DesiredCount",
});

new aws.appautoscaling.Policy("deploy-as-policy-cpu", {
  serviceNamespace: scalingTarget.serviceNamespace,
  scalableDimension: scalingTarget.scalableDimension,
  resourceId: scalingTarget.resourceId,
  policyType: "TargetTrackingScaling",
  targetTrackingScalingPolicyConfiguration: {
    predefinedMetricSpecification: {
      predefinedMetricType: "ECSServiceAverageCPUUtilization",
    },
    targetValue: 50,
  },
});

export const backendUrl = listener.endpoint.hostname;
export const frontendUrl = distribution.domainName;
export const frontendBucketName = frontendBucket.id;
export const distributionId = distribution.id;
export const sesAccessKeyId = sesAccessKey.id;
export const sesSecretAccessKey = sesAccessKey.secret;
export const sesDomainVerificationToken = sesDomainIdentity.verificationToken;
