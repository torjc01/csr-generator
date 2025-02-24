const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => res.render('index'));
app.post('/generate-csr', (req, res) => {
    const { commonName, email, keySize, profile } = req.body;

    let organization = "Centre Quebecois d'Excellence Numerique";
    let organizationalUnit = "Autorite de Certification XRoad Dev v1";
    let city= "Quebec";
    let state= "QC";
    let country= "CA";
    
    // Generate CSR and Private Key
    const opensslCommand = `openssl req -new -newkey rsa:${keySize} -nodes -keyout /app/private.key -out /app/csr.pem -subj "/C=${country}/ST=${state}/L=${city}/O=${organization}/OU=${organizationalUnit}/CN=${commonName}"`;
    
    exec(opensslCommand, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send(`Error: ${error.message}`);
        }
        
        // Read generated files
        const fs = require('fs');
        const privateKey = fs.readFileSync('/app/private.key', 'utf8');
        const csr = fs.readFileSync('/app/csr.pem', 'utf8');
        
        // Cleanup files
        fs.unlinkSync('/app/private.key');
        fs.unlinkSync('/app/csr.pem');
        
        res.render('result', { privateKey, csr });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));