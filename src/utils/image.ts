const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL;

export function toUrl(imageUrl: string) {
  if (String(imageUrl).startsWith("public/")) {
    return `${baseUrl}${imageUrl}`;
  } else if (String(imageUrl).startsWith("http")) {
    return imageUrl;
  }
}
