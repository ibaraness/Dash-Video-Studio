export function annonymousReadPolicy(bucketName: string) {
    return JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": [
                        "*"
                    ]
                },
                "Action": [
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    `arn:aws:s3:::${bucketName}`
                ]
            },
            {
                "Effect": "Allow",
                "Principal": {
                    "AWS": [
                        "*"
                    ]
                },
                "Action": [
                    "s3:GetObject"
                ],
                "Resource": [
                    `arn:aws:s3:::${bucketName}/*`
                ]
            }
        ]
    });
}