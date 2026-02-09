<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alert Message Demo</title>
    <link rel="stylesheet" href="alert.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 50px;
            background: #f5f5f5;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        h1 {
            color: #333;
            margin-bottom: 30px;
        }
        
        button {
            padding: 12px 24px;
            margin: 5px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            color: white;
            transition: opacity 0.2s;
        }
        
        button:hover {
            opacity: 0.8;
        }
        
        .btn-success { background: #10b981; }
        .btn-error { background: #ef4444; }
        .btn-warning { background: #f59e0b; }
        .btn-info { background: #3b82f6; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Alert Message Demo</h1>
        
        <p>Klik tombol di bawah untuk melihat alert:</p>
        
        <div>
            <button class="btn-success" onclick="MsgAlert.success('Data berhasil disimpan!')">
                Success Alert
            </button>
            
            <button class="btn-error" onclick="MsgAlert.error('Terjadi kesalahan!')">
                Error Alert
            </button>
            
            <button class="btn-warning" onclick="MsgAlert.warning('Perhatian! Periksa kembali data Anda.')">
                Warning Alert
            </button>
            
            <button class="btn-info" onclick="MsgAlert.info('Informasi: Sistem akan maintenance malam ini.')">
                Info Alert
            </button>
        </div>
    </div>

    <script src="alert.js"></script>
</body>
</html>