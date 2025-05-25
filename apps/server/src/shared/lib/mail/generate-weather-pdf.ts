import type { FavoritePlaceWithWeatherType } from "@/messages/application/send-daily-report.usecase";
import PDFDocument from "pdfkit";

// Função para calcular estatísticas
function calculateStatistics(weatherData: any[]) {
  if (weatherData.length === 0) return null;

  const totals = weatherData.reduce(
    (acc, curr) => ({
      temperature: acc.temperature + parseFloat(curr.temperature),
      humidity: acc.humidity + curr.humidity,
      pressure: acc.pressure + curr.pressure,
      windSpeed: acc.windSpeed + parseFloat(curr.windSpeed),
    }),
    { temperature: 0, humidity: 0, pressure: 0, windSpeed: 0 }
  );

  return {
    averages: {
      temperature: (totals.temperature / weatherData.length).toFixed(1),
      humidity: Math.round(totals.humidity / weatherData.length),
      pressure: Math.round(totals.pressure / weatherData.length),
      windSpeed: (totals.windSpeed / weatherData.length).toFixed(1),
    },
    minMax: {
      minTemp: Math.min(
        ...weatherData.map((d) => parseFloat(d.temperature))
      ).toFixed(1),
      maxTemp: Math.max(
        ...weatherData.map((d) => parseFloat(d.temperature))
      ).toFixed(1),
      minHumidity: Math.min(...weatherData.map((d) => d.humidity)),
      maxHumidity: Math.max(...weatherData.map((d) => d.humidity)),
    },
  };
}

// Função para desenhar gráfico simples no PDF
const drawSimpleChart = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  data: number[],
  label: string,
  color: string = "#667eea"
) => {
  // Desenhar borda do gráfico
  doc.rect(x, y, width, height).stroke();

  // Título do gráfico
  doc.fontSize(10).text(label, x, y - 15);

  if (data.length === 0) {
    doc.fontSize(8).text("Sem dados", x + width / 2 - 20, y + height / 2);
    return;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  // Desenhar linha do gráfico
  doc.strokeColor(color).lineWidth(2);

  const stepX = width / (data.length - 1 || 1);
  let startX = x;
  let startY = y + height - ((data[0] - minValue) / range) * height;

  doc.moveTo(startX, startY);

  for (let i = 1; i < data.length; i++) {
    const pointX = x + i * stepX;
    const pointY = y + height - ((data[i] - minValue) / range) * height;
    doc.lineTo(pointX, pointY);
  }

  doc.stroke();

  // Valores min/max
  doc.fontSize(8).fillColor("#666666");
  doc.text(`Max: ${maxValue.toFixed(1)}`, x + width - 60, y + 5);
  doc.text(`Min: ${minValue.toFixed(1)}`, x + width - 60, y + 15);

  // Resetar cores
  doc.strokeColor("#000").fillColor("#000");
};

// Função principal para gerar PDF usando PDFKit
export async function generateWeatherPDF(
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        info: {
          Title: `Weather Sync - Relatório Meteorológico - ${reportDate}`,
          Author: "Weather Sync",
          Subject: "Relatório Meteorológico",
          Keywords: "weather, meteorologia, relatório",
        },
      });

      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Cores do tema
      const primaryColor = "#667eea";
      const secondaryColor = "#764ba2";
      const textColor = "#333333";
      const lightGray = "#f8f9fa";

      // HEADER
      const pageWidth = doc.page.width;
      const headerHeight = 120;

      // Gradiente simulado com retângulos
      doc.rect(0, 0, pageWidth, headerHeight).fillColor(primaryColor).fill();

      doc
        .rect(0, 0, pageWidth, headerHeight / 2)
        .fillColor(secondaryColor)
        .fillOpacity(0.8)
        .fill();

      // Título principal
      doc
        .fillColor("white")
        .fillOpacity(1)
        .fontSize(32)
        .font("Helvetica-Bold")
        .text("🌤️ Weather Sync", 50, 30, { align: "center" });

      // Subtítulo
      doc
        .fontSize(16)
        .font("Helvetica")
        .text(`Relatório Meteorológico - ${reportDate}`, 50, 70, {
          align: "center",
        });

      // Voltar para a cor de texto normal
      doc.fillColor(textColor);

      let currentY = headerHeight + 40;

      // SAUDAÇÃO
      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(`Olá, ${userName}!`, 50, currentY);

      currentY += 30;

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(
          "Este é o seu relatório meteorológico personalizado com os dados dos seus locais favoritos.",
          50,
          currentY,
          {
            width: pageWidth - 100,
          }
        );

      currentY += 40;

      // ESTATÍSTICAS GERAIS
      const totalPlaces = favoritePlaces.length;
      const totalReadings = favoritePlaces.reduce(
        (sum, place) => sum + place.weatherData.length,
        0
      );

      // Caixas de estatísticas
      const boxWidth = 200;
      const boxHeight = 80;
      const boxSpacing = 50;
      const startX = (pageWidth - (boxWidth * 2 + boxSpacing)) / 2;

      // Caixa 1 - Locais Monitorados
      doc
        .rect(startX, currentY, boxWidth, boxHeight)
        .fillColor(lightGray)
        .fill()
        .strokeColor("#e9ecef")
        .stroke();

      doc
        .fillColor(primaryColor)
        .fontSize(36)
        .font("Helvetica-Bold")
        .text(totalPlaces.toString(), startX, currentY + 15, {
          width: boxWidth,
          align: "center",
        });

      doc
        .fillColor("#666666")
        .fontSize(12)
        .font("Helvetica")
        .text("Locais Monitorados", startX, currentY + 55, {
          width: boxWidth,
          align: "center",
        });

      // Caixa 2 - Leituras Totais
      doc
        .rect(startX + boxWidth + boxSpacing, currentY, boxWidth, boxHeight)
        .fillColor(lightGray)
        .fill()
        .strokeColor("#e9ecef")
        .stroke();

      doc
        .fillColor(primaryColor)
        .fontSize(36)
        .font("Helvetica-Bold")
        .text(
          totalReadings.toString(),
          startX + boxWidth + boxSpacing,
          currentY + 15,
          {
            width: boxWidth,
            align: "center",
          }
        );

      doc
        .fillColor("#666666")
        .fontSize(12)
        .font("Helvetica")
        .text(
          "Leituras Totais",
          startX + boxWidth + boxSpacing,
          currentY + 55,
          {
            width: boxWidth,
            align: "center",
          }
        );

      currentY += boxHeight + 50;

      // DADOS POR LOCAL
      favoritePlaces.forEach((place, index) => {
        // Verificar se precisa de nova página
        if (currentY > doc.page.height - 300) {
          doc.addPage();
          currentY = 50;
        }

        const stats = calculateStatistics(place.weatherData);
        const placeName = place.name || `Local ${place.placeId}`;

        // Seção do local
        doc
          .rect(40, currentY - 10, pageWidth - 80, 250)
          .fillColor(lightGray)
          .fill();

        // Título do local
        doc
          .fillColor(textColor)
          .fontSize(18)
          .font("Helvetica-Bold")
          .text(`📍 ${placeName}`, 60, currentY);

        currentY += 35;

        if (stats) {
          // Grid de métricas (2x2)
          const metricBoxWidth = 150;
          const metricBoxHeight = 60;
          const metricSpacing = 20;
          const metricsStartX = 60;

          // Temperatura
          doc
            .rect(metricsStartX, currentY, metricBoxWidth, metricBoxHeight)
            .fillColor("white")
            .fill()
            .strokeColor("#e9ecef")
            .stroke();

          doc
            .fillColor("#666666")
            .fontSize(10)
            .font("Helvetica")
            .text("🌡️ TEMPERATURA", metricsStartX + 10, currentY + 10);

          doc
            .fillColor(textColor)
            .fontSize(18)
            .font("Helvetica-Bold")
            .text(
              `${stats.averages.temperature}°C`,
              metricsStartX + 10,
              currentY + 25
            );

          doc
            .fillColor("#999999")
            .fontSize(8)
            .text(
              `${stats.minMax.minTemp}°C - ${stats.minMax.maxTemp}°C`,
              metricsStartX + 10,
              currentY + 45
            );

          // Umidade
          doc
            .rect(
              metricsStartX + metricBoxWidth + metricSpacing,
              currentY,
              metricBoxWidth,
              metricBoxHeight
            )
            .fillColor("white")
            .fill()
            .strokeColor("#e9ecef")
            .stroke();

          doc
            .fillColor("#666666")
            .fontSize(10)
            .font("Helvetica")
            .text(
              "💧 UMIDADE",
              metricsStartX + metricBoxWidth + metricSpacing + 10,
              currentY + 10
            );

          doc
            .fillColor(textColor)
            .fontSize(18)
            .font("Helvetica-Bold")
            .text(
              `${stats.averages.humidity}%`,
              metricsStartX + metricBoxWidth + metricSpacing + 10,
              currentY + 25
            );

          doc
            .fillColor("#999999")
            .fontSize(8)
            .text(
              `${stats.minMax.minHumidity}% - ${stats.minMax.maxHumidity}%`,
              metricsStartX + metricBoxWidth + metricSpacing + 10,
              currentY + 45
            );

          currentY += metricBoxHeight + 15;

          // Pressão
          doc
            .rect(metricsStartX, currentY, metricBoxWidth, metricBoxHeight)
            .fillColor("white")
            .fill()
            .strokeColor("#e9ecef")
            .stroke();

          doc
            .fillColor("#666666")
            .fontSize(10)
            .font("Helvetica")
            .text("🔵 PRESSÃO", metricsStartX + 10, currentY + 10);

          doc
            .fillColor(textColor)
            .fontSize(18)
            .font("Helvetica-Bold")
            .text(
              `${stats.averages.pressure} hPa`,
              metricsStartX + 10,
              currentY + 25
            );

          // Vento
          doc
            .rect(
              metricsStartX + metricBoxWidth + metricSpacing,
              currentY,
              metricBoxWidth,
              metricBoxHeight
            )
            .fillColor("white")
            .fill()
            .strokeColor("#e9ecef")
            .stroke();

          doc
            .fillColor("#666666")
            .fontSize(10)
            .font("Helvetica")
            .text(
              "💨 VENTO",
              metricsStartX + metricBoxWidth + metricSpacing + 10,
              currentY + 10
            );

          doc
            .fillColor(textColor)
            .fontSize(18)
            .font("Helvetica-Bold")
            .text(
              `${stats.averages.windSpeed} km/h`,
              metricsStartX + metricBoxWidth + metricSpacing + 10,
              currentY + 25
            );

          currentY += metricBoxHeight + 20;

          // Gráficos simples
          if (place.weatherData.length > 0) {
            const temperatures = place.weatherData.map((d) =>
              parseFloat(d.temperature)
            );
            const humidity = place.weatherData.map((d) => d.humidity);

            // Gráfico de temperatura
            drawSimpleChart(
              doc,
              60,
              currentY,
              200,
              60,
              temperatures,
              "Temperatura (°C)",
              "#ff6384"
            );

            // Gráfico de umidade
            drawSimpleChart(
              doc,
              300,
              currentY,
              200,
              60,
              humidity,
              "Umidade (%)",
              "#36a2eb"
            );

            currentY += 80;
          }

          // Info dos dados
          doc
            .fillColor("#666666")
            .fontSize(10)
            .font("Helvetica-Oblique")
            .text(
              `Baseado em ${place.weatherData.length} leituras nas últimas 24 horas`,
              60,
              currentY,
              {
                align: "center",
                width: pageWidth - 120,
              }
            );
        } else {
          // Sem dados
          doc
            .fillColor("#999999")
            .fontSize(14)
            .font("Helvetica-Oblique")
            .text("Sem dados disponíveis para este local", 60, currentY + 50, {
              align: "center",
              width: pageWidth - 120,
            });
        }

        currentY += 60;
      });

      // FOOTER
      if (currentY > doc.page.height - 100) {
        doc.addPage();
        currentY = 50;
      } else {
        currentY = doc.page.height - 80;
      }

      doc
        .rect(0, currentY - 20, pageWidth, 80)
        .fillColor(lightGray)
        .fill();

      doc
        .fillColor("#666666")
        .fontSize(12)
        .font("Helvetica")
        .text(
          "Relatório gerado automaticamente pelo Weather Sync",
          50,
          currentY,
          {
            align: "center",
            width: pageWidth - 100,
          }
        );

      doc
        .fontSize(10)
        .text(
          `© ${new Date().getFullYear()} Weather Sync. Todos os direitos reservados.`,
          50,
          currentY + 20,
          {
            align: "center",
            width: pageWidth - 100,
          }
        );

      // Finalizar o documento
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
