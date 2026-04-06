const UPSTREAM_API_BASE = String(
  process.env.NEXT_PUBLIC_API_BASE ||
  process.env.API_BASE ||
  'https://ridefleetmanager.com'
)
  .trim()
  .replace(/\/$/, '');

function buildUpstreamUrl(request, params) {
  const path = Array.isArray(params?.path) ? params.path.join('/') : '';
  const requestUrl = new URL(request.url);
  const query = requestUrl.search || '';
  return `${UPSTREAM_API_BASE}/api/public/${path}${query}`;
}

async function proxyPublicRequest(request, context) {
  const upstreamUrl = buildUpstreamUrl(request, context?.params);
  const headers = new Headers();
  const contentType = request.headers.get('content-type');

  if (contentType) headers.set('content-type', contentType);
  const accept = request.headers.get('accept');
  if (accept) headers.set('accept', accept);

  const method = request.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);
  const body = hasBody ? await request.text() : undefined;

  const upstream = await fetch(upstreamUrl, {
    method,
    headers,
    body,
    cache: 'no-store'
  });

  const responseHeaders = new Headers();
  const upstreamContentType = upstream.headers.get('content-type');
  if (upstreamContentType) responseHeaders.set('content-type', upstreamContentType);

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: responseHeaders
  });
}

export async function GET(request, context) {
  return proxyPublicRequest(request, context);
}

export async function POST(request, context) {
  return proxyPublicRequest(request, context);
}

export async function PUT(request, context) {
  return proxyPublicRequest(request, context);
}

export async function PATCH(request, context) {
  return proxyPublicRequest(request, context);
}

export async function DELETE(request, context) {
  return proxyPublicRequest(request, context);
}

export async function OPTIONS(request, context) {
  return proxyPublicRequest(request, context);
}
