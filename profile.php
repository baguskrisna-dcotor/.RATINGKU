<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" href="login-style.css">
    <link rel="stylesheet" href="css/universal.css">
</head>
<body>
    <div class="login-container">
        <h1>Welcome Back</h1>
        <p>Login to access your profile</p>
        
        <div id="alertBox" class="alert"></div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required placeholder="your@email.com">
            </div>
            
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="Enter your password">
            </div>
            
            <button type="submit" class="btn" id="loginBtn">Login</button>
        </form>
        
        <div class="divider">or</div>
        
        <div class="link">
            Don't have an account? <a href="register.html">Register here</a>
        </div>
    </div>

    <script type="module" src="login.js"></script>
</body>
</html>