import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required for diagnosis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.PLANT_ID_API_KEY || process.env.NEXT_PUBLIC_PLANT_ID_API_KEY;

    // Fallback Mock mode if API Key is not configured or set to mock
    if (!apiKey || apiKey === 'your_plant_id_api_key_here' || apiKey === 'mock') {
      console.warn('[V-Link API] Plant.id API Key not configured. Using Mock response.');
      
      // Simulate API network latency
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Return a structured mock response resembling Plant.id v3 health_assessment
      return NextResponse.json({
        is_mock: true,
        result: {
          is_plant: {
            binary: true,
            probability: 0.98,
          },
          health_assessment: {
            is_healthy: {
              binary: false,
              probability: 0.85,
            },
            diseases: [
              {
                name: 'Tomato Late Blight (Phytophthora infestans)',
                probability: 0.87,
                description: 'Late blight is a destructive disease attacking tomatoes and potatoes. It is caused by the oomycete Phytophthora infestans, which thrives in cool, wet weather.',
                treatment: {
                  chemical: [
                    'Apply copper-based fungicides immediately to protect uninfected leaves.',
                    'Use chlorothalonil or mancozeb as protective sprays.'
                  ],
                  biological: [
                    'Apply bio-fungicides containing Bacillus subtilis to suppress pathogen expansion.',
                    'Improve soil aeration and apply compost tea to enhance beneficial microbial activity.'
                  ],
                  prevention: [
                    'Rotate crops annually; do not plant tomatoes near potatoes.',
                    'Provide drip irrigation to keep foliage dry.',
                    'Ensure wide spacing between plants for adequate airflow.',
                    'Prune and destroy infected leaves immediately. Do not compost infected plant debris.'
                  ]
                }
              },
              {
                name: 'Tomato Leaf Mold (Passalora fulva)',
                probability: 0.12,
                description: 'Leaf mold is a fungal disease that thrives in high humidity and moderate temperatures, causing yellow spots on leaf tops and velvet-like mold underneath.',
                treatment: {
                  chemical: ['Apply sulfur-based sprays or systemic fungicides.'],
                  biological: ['Spray neem oil solution to control early spread.'],
                  prevention: [
                    'Maintain humidity levels below 85% in greenhouses.',
                    'Ensure ventilation and plant resistant tomato varieties.'
                  ]
                }
              }
            ]
          }
        }
      });
    }

    // Prepare payload for Plant.id API
    let base64Image = image;
    if (image.includes(';base64,')) {
      base64Image = image.split(';base64,')[1];
    }

    const payload = {
      images: [base64Image],
      similar_images: true,
    };

    const apiResponse = await fetch('https://api.plant.id/v3/health_assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('[V-Link API] Plant.id API responded with error:', errorText);
      return NextResponse.json(
        { error: `Plant.id API error: ${apiResponse.status} ${apiResponse.statusText}` },
        { status: apiResponse.status }
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[V-Link API] Diagnosis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze crop image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
