const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const xlsx = require("xlsx");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require("cors");

const app = express();
const port = 5001;

// Sequelize setup


const sequelize = new Sequelize("todo_list", "root", "raju@8790", {
  host: "localhost",
  dialect: "mysql",
  logging: false,
});

const ExcelData = sequelize.define('TodoItem', {
  s_no: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tast: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Status1 : {
    type: DataTypes.STRING, // assuming status can be either pending or completed
    allowNull: true
  },
  Date: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

// Sync the model with the database
(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Model synchronized successfully");
  } catch (error) {
    console.error("Error synchronizing model:", error);
  }
})();


// Multer setup for file upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



// Middleware
app.use(cors());
app.use(bodyParser.json());

const excelDateToJSDate = (excelDate) => {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); 
    const jsDate = new Date(excelEpoch.getTime() + excelDate * 86400000); 
    return jsDate;
  };

// Endpoint to handle file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });

    const sheet_name_list = workbook.SheetNames;
    const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
      header: 1,
    });

    
    const headers = jsonData.shift();


    const cleanHeaders = headers.map((header) => {
      if (typeof header === "string") {
        return header.trim().replace(/[^a-zA-Z0-9_]/g, "");
      } else {
        return header; 
      }
    });


    const parsedData = jsonData.map((row) => {
      const rowData = Object.fromEntries(
        row.map((value, index) => [cleanHeaders[index], value])
      );

      // Convert Date field to JavaScript Date object if it is a valid Excel date serial number
      if (rowData.Date && !isNaN(rowData.Date)) {
        rowData.Date = excelDateToJSDate(rowData.Date);
      }

      return rowData;
    });

    await sequelize.sync({ force: true });
    await ExcelData.bulkCreate(parsedData);
    res.send("Data inserted successfully");
  } catch (error) {
    console.error("Error processing upload:", error);
    res.status(500).send("Internal server error");
  }
});



// Endpoint to get all data
app.get('/data', async (req, res) => {
    try {
        if (!ExcelData) {
          throw new Error('ExcelData model is not defined');
        }
        const data = await ExcelData.findAll({});
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to delete data by ID
app.delete('/data/:id', async (req, res) => {
    const id = req.params.id;
    try {
        if (!ExcelData) {
          throw new Error('ExcelData model is not defined');
        }
        await ExcelData.destroy({
            where: {
                id: id
            }
        });
        res.send('Data deleted successfully');
    } catch (error) {
        console.error('Error deleting data:', error);
        res.status(500).send('Internal server error');
    }
});

// Endpoint to update data by ID
app.put('/data/:id', async (req, res) => {
    const id = req.params.id;
    const newData = req.body;
    try {
        if (!ExcelData) {
          throw new Error('ExcelData model is not defined');
        }
        await ExcelData.update(newData, {
            where: {
                id: id
            }
        });
        res.send('Data updated successfully');
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).send('Internal server error');
    }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
