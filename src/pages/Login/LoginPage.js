import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";
import api from "../../api/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

useEffect(() => {
  const hasAccessToken = !!localStorage.getItem("accessToken");
  if (!hasAccessToken) return;
  const raw = localStorage.getItem("accessTokenExpiresIn");
  let expMs = raw ? parseInt(raw, 10) : NaN;
  if (!Number.isFinite(expMs)) return;

  if (expMs < 1e12) expMs = expMs * 1000;

  const now = Date.now();
  const threshold = 3 * 60 * 1000;
  if (expMs <= now) return;

  const warnDelay = Math.max(0, expMs - now - threshold);
  if (warnDelay === 0 && sessionStorage.getItem('warnedSoon') === '1') return;

  const id = setTimeout(() => {
    alert("세션이 곧 만료됩니다. 자동 연장되거나 다시 로그인해 주세요.");
    sessionStorage.setItem('warnedSoon', '1');
  }, warnDelay);

  return () => clearTimeout(id);
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      await api.get(`/auth/check-email-auth?email=${email}`);

      // 200이 오면 무조건 로그인 진행
    } catch (checkError) {
      const status = checkError.response?.status;
      const message = checkError.response?.data;
    
      if (status === 409 && message === "탈퇴 이력이 있는 이메일입니다.") {
        setErrorMessage("탈퇴한 이메일입니다. 다른 이메일로 회원가입해주세요.");
        return; 
      }
    
      // 이미 가입된 이메일은 그냥 통과시켜서 로그인 시도
      if (status === 409 && message === "이미 가입된 이메일입니다.") {
        // 통과 → 로그인 진행
      } else {
        setErrorMessage("이메일 확인이 완료되지 않았습니다. 다시 시도해 주세요.");
        return;
      }
    }
    
  
    try {
      // 로그인 요청
      const response = await api.post("/auth/sign-in", { email, password });
      const {
        accessToken,
        refreshToken,
        accessTokenExpiresIn,
        grantType,
        role,
      } = response.data;
  
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("accessTokenExpiresIn", accessTokenExpiresIn);
      localStorage.setItem("grantType", grantType);
      localStorage.setItem("role", role);

      // 권한에 따라 페이지 이동
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/main");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setErrorMessage("로그인이 완료되지 않았습니다. 다시 한 번 시도해 주세요.");
      }
    }
  };
  
  return (
    <div className="login-container">
      {/* 상단 회원가입 버튼 */}
      <header className="login-header">
        <Link to="/signup" className="signup-button english-text">
          sign up
        </Link>
      </header>

      <div className="login-box">
        <h2 className="login-title">
          <img src="/logo.png" alt="logo" className="login-logo" />
        </h2>

        <form className="login-form" onSubmit={handleLogin}>
          {/* 이메일(ID) 입력 */}
          <label htmlFor="username" className="label english-text">Email</label>
          <input
            type="text"
            id="username"
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage('');
            }}          
            required
          />
          

          {/* 비밀번호 입력 */}
          <label htmlFor="password" className="label english-text">Password</label>
          <div className="password-input-wrapper">
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              placeholder="Password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {password.length > 0 && (
              <span
                className="toggle-password-icon"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
              </span>
            )}
          </div>

          {/* 에러 메시지 표시 */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}

          {/* 로그인 버튼 */}
          <button type="submit" className="login-button english-text">
            Log in
          </button>
        </form>

        {/* 하단 회원가입 링크 */}
        <div className="bottom-links">
          <Link to="/signup" className="help-link">
            회원 가입하기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
