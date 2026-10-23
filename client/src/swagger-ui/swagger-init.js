const AlwaysEnableTryItOutPlugin = function () {
  return {
    components: {
      TryItOutButton: () => null,
    },
  };
};

function createAxiosConfig(serverBaseUri) {
  return {
    timeout: 5000,
    baseURL: serverBaseUri,
  };
}

async function fetchUrls(serverBaseUri, axiosConfig, baseUrl) {
  let urls;

  if (!urls || urls.length === 0) {
    try {
      const response = await axios.get('/management/jhiopenapigroups', axiosConfig);
      if (Array.isArray(response.data)) {
        urls = response.data.map(({ group, description }) => ({ name: description, url: `${serverBaseUri}${baseUrl}/${group}` }));
      }
    } catch (error) {
      console.error('Failed to fetch default API docs');
    }
  }

  return urls?.length ? urls : [{ name: 'default', url: `${serverBaseUri}${baseUrl}` }];
}

function sortUrls(urls) {
  if (!urls) return urls;

  urls.sort((a, b) => compareUrls(a.name.toLowerCase(), b.name.toLowerCase()));

  return urls;
}

function compareUrls(nameA, nameB) {
  if (nameA.includes('(default)')) return -1;
  if (nameB.includes('(default)')) return 1;
  if (nameA.includes('(management)')) return -1;
  if (nameB.includes('(management)')) return 1;
  return nameA.localeCompare(nameB);
}

function initializeSwaggerUI(urls, baseUrl) {
  // Build a system
  const ui = SwaggerUIBundle({
    urls: urls,
    url: baseUrl,
    dom_id: '#swagger-ui',
    deepLinking: true,
    filter: true,
    layout: 'StandaloneLayout',
    withCredentials: false,
    persistAuthorization: false,
    queryConfigEnabled: false,
    validatorUrl: null,
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    plugins: [SwaggerUIBundle.plugins.DownloadUrl, AlwaysEnableTryItOutPlugin],
    tryItOutEnabled: true,
    requestInterceptor: function (req) {
      const target = new URL(req.url, window.location.origin);
      if (target.origin !== window.location.origin || target.username || target.password) {
        throw new Error('API documentation requests must stay on this origin');
      }
      // Remove the sample Swagger UI request body if present
      if (req.method === 'GET' && req.body === '{"additionalProp1":"string","additionalProp2":"string","additionalProp3":"string"}') {
        req.body = undefined;
      }
      return req;
    },
  });

  window.ui = ui;
}

window.onload = async function () {
  const baseUrl = 'v3/api-docs';
  const serverBaseUri = document.baseURI.replace('swagger-ui/', '');
  const axiosConfig = createAxiosConfig(serverBaseUri);
  const urls = await fetchUrls(serverBaseUri, axiosConfig, baseUrl);
  const sortedUrls = sortUrls(urls);

  initializeSwaggerUI(sortedUrls, baseUrl);
};
