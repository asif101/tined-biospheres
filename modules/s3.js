import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
})

export function uploadToS3(imageBuffer, imageName, bucketName) {
  return new Promise((resolve, reject) => {
    const uploadParams = {
      Bucket: bucketName,
      Key: imageName,
      Body: imageBuffer,
      ACL: 'public-read',
    }

    s3.upload(uploadParams, function (err, data) {
      if (err) reject(err)
      else resolve(data.Location)
    })
  })
}

export function deleteFromS3(imageName, bucketName) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: imageName,
    }

    s3.deleteObject(params, function (err, data) {
      if (err) reject(err)
      else resolve(data)
    })
  })
}
