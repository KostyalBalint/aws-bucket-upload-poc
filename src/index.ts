import { S3 } from "aws-sdk";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

(async () => {
  const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  const bucket = process.env.AWS_BUCKET_NAME ?? "";

  try {
    const buckets = await s3.listBuckets().promise();
    const names = buckets.Buckets?.map((bucket) => bucket.Name) ?? [];
    console.log("Buckets", names);
    const contents = await Promise.all(
      names.map(async (name) => {
        try {
          const objects = await s3
            .listObjects({ Bucket: name ?? "" })
            .promise();
          return objects.Contents?.map((content) => content.Key);
        } catch (error) {
          return "Can't list objects";
        }
      })
    );
    console.log("Contents", contents);
  } catch (e) {
    console.log("Can't get bucket infos", e);
  }

  try {
    const object = await s3
      .listObjects({
        Bucket: bucket,
      })
      .promise();
    console.log("Objects in bucket: ", object);
  } catch (e) {
    console.log("Cannot list objects", e);
  }

  const fileName = "data/test.txt";
  const blob = fs.readFileSync(fileName);

  try {
    const uploadedImage = await s3
      .upload({
        Bucket: bucket,
        Key: fileName,
        Body: blob,
      })
      .promise();
    console.log(uploadedImage);
  } catch (e) {
    console.log("Cannot upload file", e);
  }
})();
