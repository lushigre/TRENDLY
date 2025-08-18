import { useEffect, useRef } from 'react';
import { PriceHistory } from '@shared/schema';

interface PriceChartProps {
  priceHistory: PriceHistory[];
}

export default function PriceChart({ priceHistory }: PriceChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !priceHistory.length) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((Chart) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear any existing chart
      Chart.Chart.getChart(canvas)?.destroy();

      const sortedHistory = [...priceHistory].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      const labels = sortedHistory.map(item => 
        new Date(item.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      );
      
      const prices = sortedHistory.map(item => item.price);

      new Chart.Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Price',
            data: prices,
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleColor: '#ffffff',
              bodyColor: '#ffffff',
              borderColor: '#2563eb',
              borderWidth: 1,
              displayColors: false,
              callbacks: {
                label: function(context) {
                  return `$${context.parsed.y}`;
                }
              }
            }
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12
                }
              }
            },
            y: {
              display: true,
              beginAtZero: false,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: '#6b7280',
                font: {
                  size: 12
                },
                callback: function(value) {
                  return '$' + value;
                }
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        }
      });
    });
  }, [priceHistory]);

  if (!priceHistory.length) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No price history available
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
      data-testid="price-chart"
    />
  );
}