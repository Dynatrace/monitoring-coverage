export default async function (payload: { url: string; requestInit: RequestInit }) {
  const { url, requestInit } = payload;
  const apiResponse = await fetch(url, requestInit);
  if (!apiResponse.ok) {
    const responseText = await apiResponse.text();
    return {
      data: null,
      error: "External API failed to handle the request: " + responseText,
    };
  }
  try {
    const data = await apiResponse.json();
    console.log("Success:", data);
    return { data };
  } catch (error) {
    console.error("Error:", error);
    return { error };
  }
}
