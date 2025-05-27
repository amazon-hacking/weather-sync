import * as aws from "@pulumi/aws";

export function createSESConfiguration(hostedZone: aws.route53.Zone) {
  // ==============================================
  // USUÁRIO IAM PARA SES
  // ==============================================
  const sesUser = new aws.iam.User("weather-sync-ses-user");

  const sesUserPolicy = new aws.iam.UserPolicy("ses-user-policy", {
    user: sesUser.name,
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

  // ==============================================
  // CHAVES DE ACESSO SES
  // ==============================================
  const sesAccessKey = new aws.iam.AccessKey("weather-sync-ses-access-key", {
    user: sesUser.name,
  });

  // ==============================================
  // CONFIGURAÇÃO DO DOMÍNIO SES
  // ==============================================
  const sesDomainIdentity = new aws.ses.DomainIdentity(
    "weather-sync-ses-domain",
    {
      domain: "weather-sync.com.br",
    }
  );

  const sesDomainDkim = new aws.ses.DomainDkim("weather-sync-ses-domain-dkim", {
    domain: sesDomainIdentity.domain,
  });

  // ==============================================
  // CONFIGURAÇÃO DE VERIFICAÇÃO DE DOMÍNIO
  // ==============================================
  const sesDomainVerification = new aws.route53.Record(
    "ses-domain-verification",
    {
      zoneId: hostedZone.zoneId, // Será preenchido pela hosted zone
      name: sesDomainIdentity.domain,
      type: "TXT",
      ttl: 600,
      records: [sesDomainIdentity.verificationToken],
    }
  );

  // ==============================================
  // CONFIGURAÇÃO DKIM
  // ==============================================
  const sesDkimRecords = sesDomainDkim.dkimTokens.apply((tokens) =>
    tokens.map(
      (token, index) =>
        new aws.route53.Record(`ses-dkim-record-${index}`, {
          zoneId: hostedZone.zoneId, // Será preenchido pela hosted zone
          name: `${token}._domainkey.weather-sync.com.br`,
          type: "CNAME",
          ttl: 600,
          records: [`${token}.dkim.amazonses.com`],
        })
    )
  );

  return {
    sesUser,
    sesAccessKey,
    sesDomainIdentity,
    sesDomainDkim,
    sesDomainVerification,
    sesDkimRecords,
  };
}
