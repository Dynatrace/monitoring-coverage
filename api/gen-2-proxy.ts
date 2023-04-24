/** This proxy serverless function is currently required to get access to all dynatrace environment apis */
export default async function (payload: { url: string; requestInit: RequestInit }) {
  const { url, requestInit } = payload;
  const apiResponse = await fetch(url, requestInit);
  try {
    const data = await apiResponse.json();
    console.log('Success:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
    return { error };
  }
}
