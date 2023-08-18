// Cors bypass | all it does is append 'vx-cors' searchParam

export function fetch(input: RequestInfo | URL, init?: RequestInit) {
  if (input instanceof Request) {
    const url = new URL(input.url, window.location.href);
    url.searchParams.set("vx-cors", "true");
    input = new Request(url, input);
  }
  else {
    const url = new URL(input, window.location.href);
    url.searchParams.set("vx-cors", "true");
    input = url;
  };
  
  return window.fetch(input, init);
};