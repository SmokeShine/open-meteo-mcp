#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { OpenMeteoClient } from './client.js';
import { ALL_TOOLS } from './tools.js';
import {
  ForecastParamsSchema,
  ArchiveParamsSchema,
  AirQualityParamsSchema,
  MarineParamsSchema,
  FloodParamsSchema,
  ElevationParamsSchema,
  GeocodingParamsSchema,
} from './types.js';

// =================== ROBUST CRASH HANDLERS (START) ===================
// These handlers will catch any unexpected crash and print the full details
// to stderr, which our Node.js wrapper will then capture and log.

process.on('uncaughtException', (err, origin) => {
  console.error('\n!!!!!! UNCAUGHT EXCEPTION !!!!!!\n');
  console.error(`Caught exception: ${err}`);
  console.error(`Exception origin: ${origin}`);
  console.error(err.stack); // This prints the full, detailed stack trace
  process.exit(1); // Ensure the process exits after a crash
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n!!!!!! UNHANDLED REJECTION !!!!!!\n');
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  // The 'reason' is often an Error object, so we print its stack
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
  process.exit(1);
});
// =================== ROBUST CRASH HANDLERS (END) =====================

class OpenMeteoMCPServer {
  private server: Server;
  private client: OpenMeteoClient;

  constructor() {
    this.server = new Server(
      {
        name: 'open-meteo-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    const baseURL = process.env.OPEN_METEO_API_URL || 'https://api.open-meteo.com';
    this.client = new OpenMeteoClient(baseURL);

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: ALL_TOOLS,
      };
    });

    // --- MODIFIED with targeted logging to find the silent error ---
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      // Step 1: Log the raw incoming request to see exactly what is being sent.
      console.error('--- RAW INCOMING REQUEST ---');
      console.error(JSON.stringify(request, null, 2));
      console.error('--------------------------');
      
      const { name, arguments: args } = request.params;

      try {
        // Step 2: The original application logic is wrapped in a new, local try/catch.
        switch (name) {
          case 'weather_forecast': {
            console.error('Attempting to parse arguments for "weather_forecast"...');
            const params = ForecastParamsSchema.parse(args);
            console.error('Argument parsing successful. Calling API client...');
            const result = await this.client.getForecast(params);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'weather_archive': {
            console.error('Attempting to parse arguments for "weather_archive"...');
            const params = ArchiveParamsSchema.parse(args);
            console.error('Argument parsing successful. Calling API client...');
            const result = await this.client.getArchive(params);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'air_quality': {
            const params = AirQualityParamsSchema.parse(args);
            const result = await this.client.getAirQuality(params);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'marine_weather': {
            const params = MarineParamsSchema.parse(args);
            const result = await this.client.getMarine(params);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }

          case 'elevation': {
            const params = ElevationParamsSchema.parse(args);
            const result = await this.client.getElevation(params);
            return {
              content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
            };
          }
          
          // ... other cases remain the same ...

          case 'dwd_icon_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getDwdIcon(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'gfs_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getGfs(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'meteofrance_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getMeteoFrance(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'ecmwf_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getEcmwf(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'jma_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getJma(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'metno_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getMetno(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'gem_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getGem(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'flood_forecast': {
            const params = FloodParamsSchema.parse(args);
            const result = await this.client.getFlood(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'seasonal_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getSeasonal(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'climate_projection': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getClimate(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'ensemble_forecast': {
            const params = ForecastParamsSchema.parse(args);
            const result = await this.client.getEnsemble(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }
          case 'geocoding': {
            const params = GeocodingParamsSchema.parse(args);
            const result = await this.client.getGeocoding(params);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        // Step 3: This new catch block will log the specific Zod validation error.
        console.error('\n!!!!!! EXCEPTION INSIDE CallToolRequest HANDLER !!!!!!\n');
        console.error(error); // This will print the full error object, including Zod details.
        
        // Return a valid MCP error response to the client.
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Open-Meteo MCP Server running on stdio');
  }
}

const server = new OpenMeteoMCPServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
