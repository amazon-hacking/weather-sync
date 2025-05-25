import type { FavoritePlaceWithWeatherType } from "@/messages/application/send-daily-report.usecase";
import PDFDocument from "pdfkit";
import { promises as fs } from "fs";

// Função para calcular médias
const calculateAverages = (weatherData: any[]) => {
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
    temperature: (totals.temperature / weatherData.length).toFixed(1),
    humidity: Math.round(totals.humidity / weatherData.length),
    pressure: Math.round(totals.pressure / weatherData.length),
    windSpeed: (totals.windSpeed / weatherData.length).toFixed(1),
  };
};

// Função para obter valores mínimos e máximos
const getMinMax = (weatherData: any[]) => {
  if (weatherData.length === 0) return null;

  const temperatures = weatherData.map((d) => parseFloat(d.temperature));
  const humidities = weatherData.map((d) => d.humidity);

  return {
    minTemp: Math.min(...temperatures).toFixed(1),
    maxTemp: Math.max(...temperatures).toFixed(1),
    minHumidity: Math.min(...humidities),
    maxHumidity: Math.max(...humidities),
  };
};

// Função para desenhar gráfico de linha no PDF
const drawLineChart = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: string }[],
  title: string
) => {
  // Container do gráfico
  doc.rect(x, y, width, height)
     .fillColor('#ffffff')
     .fill()
     .strokeColor('#e9ecef')
     .stroke();

  // Título
  doc.fillColor('#333333')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(title, x + 10, y + 10);

  if (data.length === 0) {
    doc.fillColor('#999999')
       .fontSize(10)
       .font('Helvetica')
       .text('Sem dados disponíveis', x + width/2 - 50, y + height/2);
    return;
  }

  const chartX = x + 40;
  const chartY = y + 40;
  const chartWidth = width - 80;
  const chartHeight = height - 80;

  // Encontrar valores min/max para escala
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;

  // Desenhar eixos
  doc.strokeColor('#cccccc')
     .lineWidth(1)
     .moveTo(chartX, chartY)
     .lineTo(chartX, chartY + chartHeight)
     .lineTo(chartX + chartWidth, chartY + chartHeight)
     .stroke();

  // Desenhar linha do gráfico
  if (data.length > 1) {
    doc.strokeColor(data[0].color || '#667eea')
       .lineWidth(2);

    const stepX = chartWidth / (data.length - 1);
    
    for (let i = 0; i < data.length; i++) {
      const pointX = chartX + i * stepX;
      const pointY = chartY + chartHeight - ((data[i].value - minValue) / range) * chartHeight;
      
      if (i === 0) {
        doc.moveTo(pointX, pointY);
      } else {
        doc.lineTo(pointX, pointY);
      }
      
      // Desenhar ponto
      doc.circle(pointX, pointY, 3)
         .fillColor(data[i].color || '#667eea')
         .fill();
    }
    
    doc.stroke();
  }

  // Labels dos valores
  doc.fillColor('#666666')
     .fontSize(8);
  
  data.forEach((item, index) => {
    const pointX = chartX + (index * chartWidth / (data.length - 1 || 1));
    doc.text(item.label, pointX - 10, chartY + chartHeight + 5);
  });

  // Valores min/max
  doc.fillColor('#999999')
     .fontSize(8)
     .text(`Max: ${maxValue.toFixed(1)}`, x + width - 60, y + 30)
     .text(`Min: ${minValue.toFixed(1)}`, x + width - 60, y + 42);
};

// Função para desenhar gráfico de barras
const drawBarChart = (
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  data: { label: string; value: number; color: string }[],
  title: string
) => {
  // Container do gráfico
  doc.rect(x, y, width, height)
     .fillColor('#ffffff')
     .fill()
     .strokeColor('#e9ecef')
     .stroke();

  // Título
  doc.fillColor('#333333')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text(title, x + 10, y + 10);

  if (data.length === 0) {
    doc.fillColor('#999999')
       .fontSize(10)
       .font('Helvetica')
       .text('Sem dados disponíveis', x + width/2 - 50, y + height/2);
    return;
  }

  const chartX = x + 40;
  const chartY = y + 40;
  const chartWidth = width - 80;
  const chartHeight = height - 80;

  // Encontrar valor máximo para escala
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  // Desenhar eixos
  doc.strokeColor('#cccccc')
     .lineWidth(1)
     .moveTo(chartX, chartY)
     .lineTo(chartX, chartY + chartHeight)
     .lineTo(chartX + chartWidth, chartY + chartHeight)
     .stroke();

  // Desenhar barras
  data.forEach((item, index) => {
    const barHeight = (item.value / maxValue) * chartHeight;
    const barX = chartX + index * (barWidth + barSpacing);
    const barY = chartY + chartHeight - barHeight;

    doc.rect(barX, barY, barWidth, barHeight)
       .fillColor(item.color || '#667eea')
       .fill();

    // Label da barra
    doc.fillColor('#666666')
       .fontSize(8)
       .text(item.label, barX, chartY + chartHeight + 5);
  });

  // Valor máximo
  doc.fillColor('#999999')
     .fontSize(8)
     .text(`Max: ${maxValue.toFixed(1)}`, x + width - 60, y + 30);
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
        size: 'A4',
        margin: 50,
        info: {
          Title: `Weather Sync - Relatório Meteorológico - ${reportDate}`,
          Author: 'Weather Sync',
          Subject: 'Relatório Meteorológico',
          Keywords: 'weather, meteorologia, relatório'
        }
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Cores do tema
      const primaryColor = '#667eea';
      const secondaryColor = '#764ba2';
      const textColor = '#333333';
      const lightGray = '#f8f9fa';

      // Calcular estatísticas
      const totalPlaces = favoritePlaces.length;
      const totalReadings = favoritePlaces.reduce(
        (sum, place) => sum + place.weatherData.length,
        0
      );

      // Gerar dados dos gráficos para cada local
      const chartsData = favoritePlaces.map((place) => {
        const chartData = place.weatherData.map((item) => ({
          hora: item.createdAt ? new Date(item.createdAt).getHours() : null,
          temperatura: parseFloat(item.temperature),
          umidade: item.humidity,
          pressao: item.pressure,
          vento: parseFloat(item.windSpeed),
        }));

        return {
          placeId: place.placeId,
          placeName: place.name || `Local ${place.placeId}`,
          data: chartData,
          averages: calculateAverages(place.weatherData),
          minMax: getMinMax(place.weatherData),
        };
      });

      // HEADER
      const pageWidth = doc.page.width;
      const headerHeight = 120;
      
      // Gradiente simulado com retângulos
      doc.rect(0, 0, pageWidth, headerHeight)
         .fillColor(primaryColor)
         .fill();
      
      doc.rect(0, 0, pageWidth, headerHeight/2)
         .fillColor(secondaryColor)
         .fillOpacity(0.8)
         .fill();

      // Título principal
      doc.fillColor('white')
         .fillOpacity(1)
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('🌤️ Weather Sync', 50, 30, { align: 'center' });

      // Subtítulo
      doc.fontSize(16)
         .font('Helvetica')
         .text(`Relatório Meteorológico - ${reportDate}`, 50, 70, { align: 'center' });

      // Voltar para a cor de texto normal
      doc.fillColor(textColor);

      let currentY = headerHeight + 40;

      // SAUDAÇÃO
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(`Olá, ${userName}!`, 50, currentY);
      
      currentY += 30;
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Este é o seu relatório meteorológico personalizado com os dados dos seus locais favoritos.', 50, currentY, {
           width: pageWidth - 100
         });

      currentY += 40;

      // ESTATÍSTICAS GERAIS
      // Caixas de estatísticas
      const boxWidth = 200;
      const boxHeight = 80;
      const boxSpacing = 50;
      const startX = (pageWidth - (boxWidth * 2 + boxSpacing)) / 2;

      // Caixa 1 - Locais Monitorados
      doc.rect(startX, currentY, boxWidth, boxHeight)
         .fillColor(lightGray)
         .fill()
         .strokeColor('#e9ecef')
         .stroke();

      doc.fillColor(primaryColor)
         .fontSize(36)
         .font('Helvetica-Bold')
         .text(totalPlaces.toString(), startX, currentY + 15, {
           width: boxWidth,
           align: 'center'
         });

      doc.fillColor('#666666')
         .fontSize(12)
         .font('Helvetica')
         .text('Locais Monitorados', startX, currentY + 55, {
           width: boxWidth,
           align: 'center'
         });

      // Caixa 2 - Leituras Totais
      doc.rect(startX + boxWidth + boxSpacing, currentY, boxWidth, boxHeight)
         .fillColor(lightGray)
         .fill()
         .strokeColor('#e9ecef')
         .stroke();

      doc.fillColor(primaryColor)
         .fontSize(36)
         .font('Helvetica-Bold')
         .text(totalReadings.toString(), startX + boxWidth + boxSpacing, currentY + 15, {
           width: boxWidth,
           align: 'center'
         });

      doc.fillColor('#666666')
         .fontSize(12)
         .font('Helvetica')
         .text('Leituras Totais', startX + boxWidth + boxSpacing, currentY + 55, {
           width: boxWidth,
           align: 'center'
         });

      currentY += boxHeight + 50;

      // DADOS POR LOCAL
      chartsData.forEach((placeData, index) => {
        // Verificar se precisa de nova página
        if (currentY > doc.page.height - 400) {
          doc.addPage();
          currentY = 50;
        }

        // Seção do local
        doc.rect(40, currentY - 10, pageWidth - 80, 350)
           .fillColor(lightGray)
           .fill();

        // Título do local
        doc.fillColor(textColor)
           .fontSize(18)
           .font('Helvetica-Bold')
           .text(`📍 ${placeData.placeName}`, 60, currentY);

        currentY += 35;

        if (placeData.averages && placeData.minMax) {
          // Grid de métricas (2x2)
          const metricBoxWidth = 150;
          const metricBoxHeight = 60;
          const metricSpacing = 20;
          const metricsStartX = 60;

          // Temperatura
          doc.rect(metricsStartX, currentY, metricBoxWidth, metricBoxHeight)
             .fillColor('white')
             .fill()
             .strokeColor('#e9ecef')
             .stroke();

          doc.fillColor('#666666')
             .fontSize(10)
             .font('Helvetica')
             .text('🌡️ TEMPERATURA', metricsStartX + 10, currentY + 10);

          doc.fillColor(textColor)
             .fontSize(18)
             .font('Helvetica-Bold')
             .text(`${placeData.averages.temperature}°C`, metricsStartX + 10, currentY + 25);

          doc.fillColor('#999999')
             .fontSize(8)
             .text(`${placeData.minMax.minTemp}°C - ${placeData.minMax.maxTemp}°C`, metricsStartX + 10, currentY + 45);

          // Umidade
          doc.rect(metricsStartX + metricBoxWidth + metricSpacing, currentY, metricBoxWidth, metricBoxHeight)
             .fillColor('white')
             .fill()
             .strokeColor('#e9ecef')
             .stroke();

          doc.fillColor('#666666')
             .fontSize(10)
             .font('Helvetica')
             .text('💧 UMIDADE', metricsStartX + metricBoxWidth + metricSpacing + 10, currentY + 10);

          doc.fillColor(textColor)
             .fontSize(18)
             .font('Helvetica-Bold')
             .text(`${placeData.averages.humidity}%`, metricsStartX + metricBoxWidth + metricSpacing + 10, currentY + 25);

          doc.fillColor('#999999')
             .fontSize(8)
             .text(`${placeData.minMax.minHumidity}% - ${placeData.minMax.maxHumidity}%`, metricsStartX + metricBoxWidth + metricSpacing + 10, currentY + 45);

          currentY += metricBoxHeight + 15;

          // Pressão
          doc.rect(metricsStartX, currentY, metricBoxWidth, metricBoxHeight)
             .fillColor('white')
             .fill()
             .strokeColor('#e9ecef')
             .stroke();

          doc.fillColor('#666666')
             .fontSize(10)
             .font('Helvetica')
             .text('🔵 PRESSÃO', metricsStartX + 10, currentY + 10);

          doc.fillColor(textColor)
             .fontSize(18)
             .font('Helvetica-Bold')
             .text(`${placeData.averages.pressure} hPa`, metricsStartX + 10, currentY + 25);

          // Vento
          doc.rect(metricsStartX + metricBoxWidth + metricSpacing, currentY, metricBoxWidth, metricBoxHeight)
             .fillColor('white')
             .fill()
             .strokeColor('#e9ecef')
             .stroke();

          doc.fillColor('#666666')
             .fontSize(10)
             .font('Helvetica')
             .text('💨 VENTO', metricsStartX + metricBoxWidth + metricSpacing + 10, currentY + 10);

          doc.fillColor(textColor)
             .fontSize(18)
             .font('Helvetica-Bold')
             .text(`${placeData.averages.windSpeed} km/h`, metricsStartX + metricBoxWidth + metricSpacing + 10, currentY + 25);

          currentY += metricBoxHeight + 20;

          // Gráficos
          if (placeData.data.length > 0) {
            // Preparar dados dos gráficos
            const tempData = placeData.data.map(d => ({
              label: d.hora !== null ? d.hora + 'h' : 'N/A',
              value: d.temperatura,
              color: '#ff6384'
            }));

            const humidityData = placeData.data.map(d => ({
              label: d.hora !== null ? d.hora + 'h' : 'N/A',
              value: d.umidade,
              color: '#36a2eb'
            }));

            const pressureData = placeData.data.map(d => ({
              label: d.hora !== null ? d.hora + 'h' : 'N/A',
              value: d.pressao,
              color: '#9966ff'
            }));

            const windData = placeData.data.map(d => ({
              label: d.hora !== null ? d.hora + 'h' : 'N/A',
              value: d.vento,
              color: '#4bc0c0'
            }));

            // Gráfico de Temperatura e Umidade
            drawLineChart(doc, 60, currentY, 220, 120, tempData, 'Temperatura ao Longo do Dia');
            drawLineChart(doc, 300, currentY, 220, 120, humidityData, 'Umidade ao Longo do Dia');

            currentY += 140;

            // Gráfico de Pressão e Vento
            drawBarChart(doc, 60, currentY, 220, 120, pressureData, 'Pressão ao Longo do Dia');
            drawLineChart(doc, 300, currentY, 220, 120, windData, 'Velocidade do Vento');

            currentY += 140;
          }

          // Info dos dados
          doc.fillColor('#666666')
             .fontSize(10)
             .font('Helvetica-Oblique')
             .text(`Baseado em ${placeData.data.length} leituras nas últimas 24 horas`, 60, currentY, {
               align: 'center',
               width: pageWidth - 120
             });

        } else {
          // Sem dados
          doc.fillColor('#999999')
             .fontSize(14)
             .font('Helvetica-Oblique')
             .text('Sem dados disponíveis para este local', 60, currentY + 50, {
               align: 'center',
               width: pageWidth - 120
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

      doc.rect(0, currentY - 20, pageWidth, 80)
         .fillColor(lightGray)
         .fill();

      doc.fillColor('#666666')
         .fontSize(12)
         .font('Helvetica')
         .text('Relatório gerado automaticamente pelo Weather Sync', 50, currentY, {
           align: 'center',
           width: pageWidth - 100
         });

      doc.fontSize(10)
         .text(`© ${new Date().getFullYear()} Weather Sync. Todos os direitos reservados.`, 50, currentY + 20, {
           align: 'center',
           width: pageWidth - 100
         });

      // Finalizar o documento
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

// Função para gerar PDF e salvar em arquivo
export async function generateWeatherPDFToFile(
  userName: string,
  favoritePlaces: FavoritePlaceWithWeatherType[],
  reportDate: string,
  filePath: string
): Promise<void> {
  try {
    const pdfBuffer = await generateWeatherPDF(
      userName,
      favoritePlaces,
      reportDate
    );
    await fs.writeFile(filePath, pdfBuffer);
    console.log(`✅ PDF salvo em: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao salvar PDF em ${filePath}:`, error);
    throw error;
  }
}

export default generateWeatherPDF;