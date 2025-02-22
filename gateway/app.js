require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const { spawn } = require('child_process');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT_GATEWAY || 5000;

app.use(cors());
app.use(express.json());

// ✅ Microservices Configuration
const services = {
    "/admins": { url: process.env.ADMIN_SERVICE || "http://localhost:6000", path: "../admin/app.js" },
    "/bookings": { url: process.env.BOOKING_SERVICE || "http://localhost:6003", path: "../booking/app.js" },
    "/cars": { url: process.env.CAR_SERVICE || "http://localhost:6002", path: "../car/app.js" },
    "/reclamations": { url: process.env.RECLAMATION_SERVICE || "http://localhost:6001", path: "../reclamation/app.js" },
    "/users": { url: process.env.USER_SERVICE || "http://localhost:6004", path: "../user/app.js" }
};

// ✅ Function to Start Microservices
const microservicesProcesses = {};

const startMicroservices = () => {
    console.log("🚀 Starting Microservices...");
    for (const [route, service] of Object.entries(services)) {
        console.log(`🔄 Launching ${route} microservice...`);
        const microserviceProcess = spawn('node', [service.path], {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });

        microservicesProcesses[route] = microserviceProcess;

        microserviceProcess.on('exit', (code) => {
            console.error(`❌ Microservice ${route} exited with code ${code}. Restarting...`);
            setTimeout(() => startMicroservices(), 3000); // Restart after 3 seconds if it crashes
        });
    }
};

// ✅ Debugging: Check if each microservice is running
const checkMicroserviceHealth = async () => {
    console.log("⏳ Waiting for microservices to fully start...");
    await new Promise(resolve => setTimeout(resolve, 5000)); // ✅ Wait 5 sec before checking

    for (const [route, service] of Object.entries(services)) {
        try {
            const response = await axios.get(`${service.url}/health`);
            console.log(`✅ ${route} is UP and Running: ${response.data.message}`);
        } catch (error) {
            console.error(`❌ ${route} is NOT Responding!`);
        }
    }
};

// ✅ Verify Database Connections for Each Microservice
const verifyDatabaseConnections = async () => {
    for (const [route, service] of Object.entries(services)) {
        try {
            const response = await axios.get(`${service.url}/debug/database`);
            console.log(`🔍 ${route} Database Connection: ${response.data.status}`);
        } catch (error) {
            console.error(`⚠️ ${route} Database Not Accessible!`);
        }
    }
};

// ✅ Proxy Middleware (Ensures All HTTP Methods Work)
Object.keys(services).forEach(route => {
    app.use(route, createProxyMiddleware({
        target: services[route].url,
        changeOrigin: true,
        pathRewrite: (path, req) => {
            console.log(`🔀 Rewriting Path: ${path} → ${path.replace(route, '')}`);
            return path.replace(route, ''); // ✅ Remove prefix before forwarding
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`🔀 Forwarding ${req.method} request to ${services[route].url}${req.url}`);
        },
        onError: (err, req, res) => {
            console.error(`❌ Proxy Error on ${route}: ${err.message}`);
            res.status(502).json({ error: `Service ${route} is unavailable` });
        }
    }));
});

// ✅ Debugging Route: Check Available Services
app.get('/debug/services', (req, res) => {
    res.json({ available_services: Object.keys(services) });
});

// ✅ API Gateway Health Check
app.get('/', (req, res) => {
    res.json({ message: "API Gateway is Running 🚀" });
});

// ✅ Start API Gateway
app.listen(PORT, async () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
    startMicroservices();
    await checkMicroserviceHealth();
    await verifyDatabaseConnections();
});
