export const config = { runtime: 'edge' };

export default async function handler(request: Request) {
  return new Response(JSON.stringify({ message: 'Hello from API!' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
