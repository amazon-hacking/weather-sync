import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export function createHostedZoneAndCertificate() {
  // ==============================================
  // HOSTED ZONE
  // ==============================================
  const hostedZone = new aws.route53.Zone("weather-sync-hosted-zone", {
    name: "weather-sync.com.br",
    comment: "Hosted zone for weather-sync.com.br",
  });

  // ==============================================
  // CERTIFICADO SSL
  // ==============================================
  // Provider específico para certificados (deve ser us-east-1)
  const usEast1Provider = new aws.Provider("cert-provider", {
    region: "us-east-1",
  });

  const certificate = new aws.acm.Certificate(
    "weather-sync-cert",
    {
      domainName: "weather-sync.com.br",
      //subjectAlternativeNames: ["*.weather-sync.com.br"],
      validationMethod: "DNS",
    },
    {
      provider: usEast1Provider,
    }
  );

  // ==============================================
  // VALIDAÇÃO DNS DO CERTIFICADO
  // ==============================================
  // Criar registros para todas as opções de validação
  const validationRecords: aws.route53.Record[] = [];
  const validationFqdns: pulumi.Output<string>[] = [];

  // Para cada domínio (principal + wildcard), criar um registro de validação
  certificate.domainValidationOptions.apply((options) => {
    options.forEach((option, index) => {
      const validationRecord = new aws.route53.Record(
        `weather-sync-cert-validation-record-${index}`,
        {
          name: option.resourceRecordName,
          type: option.resourceRecordType,
          zoneId: hostedZone.zoneId,
          records: [option.resourceRecordValue],
          ttl: 60,
          allowOverwrite: true, // Importante para evitar conflitos
        }
      );

      validationRecords.push(validationRecord);
      validationFqdns.push(validationRecord.fqdn);
    });
  });

  // Aguardar validação do certificado
  const certificateValidation = new aws.acm.CertificateValidation(
    "weather-sync-cert-validation",
    {
      certificateArn: certificate.arn,
      validationRecordFqdns: validationFqdns,
    },
    {
      provider: usEast1Provider,
      dependsOn: validationRecords,
    }
  );

  // ==============================================
  // REGISTROS DNS PRINCIPAIS (SERÃO CRIADOS DEPOIS)
  // ==============================================
  // O registro A será criado no módulo frontend após CloudFront existir

  return {
    hostedZone,
    certificate,
    certificateValidation,
    validationRecords,
    // Exportar nameservers para configurar no Hostinger
    nameServers: hostedZone.nameServers,
  };
}
