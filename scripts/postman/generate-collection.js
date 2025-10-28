const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const Converter = require('openapi-to-postmanv2');

const SWAGGER_URL = 'http://localhost:3000/docs-json';
const COLLECTION_PATH = path.join(__dirname, '../../docs/postman/presupco-api.postman_collection.json');
const OPENAPI_PATH = path.join(__dirname, '../../docs/postman/openapi.json');

async function getSwaggerSpec() {
  let server;
  try {
    console.log('Starting NestJS server...');
    // Start the server if not running
    server = exec('cd ../../server && yarn start:dev');
    
    // Wait for server to start
    console.log('Waiting for server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Fetch OpenAPI spec
    console.log('Fetching OpenAPI spec from', SWAGGER_URL);
    const response = await axios.get(SWAGGER_URL);
    console.log('OpenAPI spec fetched successfully');
    
    // Save OpenAPI spec
    console.log('Saving OpenAPI spec to', OPENAPI_PATH);
    fs.writeFileSync(OPENAPI_PATH, JSON.stringify(response.data, null, 2));
    
    // Convert to Postman collection using the library directly
    console.log('Converting OpenAPI spec to Postman collection...');
    const convert = util.promisify(Converter.convert);
    const options = {
      folderStrategy: 'Tags',
      requestParametersResolution: 'Example',
      exampleParametersResolution: 'Example'
    };
    
    const result = await convert({
      type: 'json',
      data: response.data
    }, options);

    if (!result.result) {
      throw new Error('Conversion failed: ' + JSON.stringify(result.reason));
    }

    // Add Bearer token authentication and update collection
    const collection = result.output[0].data;
    
    // Add auth configuration to collection
    collection.auth = {
      type: 'bearer',
      bearer: [{
        key: 'token',
        value: '{{authToken}}',
        type: 'string'
      }]
    };
    
    // Ensure all endpoints (except auth/register and auth/login) use Bearer token
    const processItems = (items) => {
      items.forEach(item => {
        if (item.item) {
          processItems(item.item);
        } else {
          // Skip auth endpoints that don't need token
          const skipAuth = (
            (item.name === 'login' && item.request.url.path.includes('auth')) ||
            (item.name === 'register' && item.request.url.path.includes('auth'))
          );
          
          if (!skipAuth) {
            item.auth = {
              type: 'bearer',
              bearer: [{
                key: 'token',
                value: '{{authToken}}',
                type: 'string'
              }]
            };
          }
        }
      });
    };
    
    processItems(collection.item);
    
    // Save the collection
    console.log('Saving Postman collection to', COLLECTION_PATH);
    fs.writeFileSync(COLLECTION_PATH, JSON.stringify(collection, null, 2));
    console.log('Collection generated successfully');
    
    // Clean up
    console.log('Cleaning up temporary files...');
    fs.unlinkSync(OPENAPI_PATH);
    if (server) {
      console.log('Stopping server...');
      server.kill();
    }
  } catch (error) {
    console.error('Error details:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    console.error('Full error:', error);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    if (server) {
      server.kill();
    }
    process.exit(1);
  }
}

getSwaggerSpec();