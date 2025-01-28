

const express = require('express');
const mysql = require('mysql2');
const AWS = require('aws-sdk');
const app = express();
const port = process.env.PORT || 80;

/*// Create a MySQL connection pool
const db = mysql.createPool({
  host: process.env.DB_HOST,      // RDS Endpoint from environment variable
  user: process.env.DB_USER,      // RDS username from environment variable
  password: process.env.DB_PASSWORD,  // RDS password from environment variable
  database: process.env.DB_NAME   // RDS database name from environment variable
});*/

// AWS S3 setup
AWS.config.update({
  region: 'ap-south-1', // Set your region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

/*// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
  } else {
    console.log('Connected to the RDS MySQL database!');
    connection.release();
  }
});*/

// Basic route to test the server
/*app.get('/db', async (req, res) => {
  try {
    const [rows, fields] = await db.promise().query('SELECT NOW() AS current_time');
    res.send(`Current database time is: ${rows[0].current_time}`);
  } catch (err) {
    res.status(500).send('Error querying the database');
  }
});*/

// Route to fetch image from S3
app.get('/:folder/:filename', async (req, res) => {
  const { folder, filename } = req.params;  // Extract folder and filename from the URL
  const params = {
    Bucket: 'demo-s3-databucket',  // Replace with your bucket name
    Key: `${folder}/${filename}`,                 // Use the filename parameter dynamically
  };

  try {
    // Get the file from S3
    const s3Object = await s3.getObject(params).promise();
    
    // Set the correct content type based on the file's MIME type
    res.setHeader('Content-Type', s3Object.ContentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');  // Cache for a year (optional)

    // Send the image content to the client
    res.send(s3Object.Body);
  } catch (error) {
    console.error('Error fetching image from S3:', error);
    res.status(500).send('Error fetching the image from S3');
  }
});


/*fetch('https://demo-s3-databucket.s3.ap-south-1.amazonaws.com/1.jpg')
  .then(response => response.blob())
  .then(imageBlob => {
    const imageObjectURL = URL.createObjectURL(imageBlob);
    document.getElementById('myImage').src = imageObjectURL;
  console.log("success fetxhing");

  })
  .catch(error => console.error('Error fetching image:', error));*/
app.get('/', (req, res) => {
  res.send('Hello, AWS Elastic Beanstalk!');
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
