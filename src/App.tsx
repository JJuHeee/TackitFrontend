import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { notificationSSE } from './services/notificationSSE'
import LoginPage from './pages/Login/LoginPage'
import SignupPage from './pages/Signup/SignupPage'
import FreePostList from './pages/FreePost/FreePostList'
import FreePostDetail from './pages/FreePost/FreePostDetail'
import FreePostWrite from './pages/FreePost/FreePostWrite'
import FreePostEdit from './pages/FreePost/FreePostEdit'
import QnaPostList from './pages/QnaPost/QnaPostList'
import QnaPostDetail from './pages/QnaPost/QnaPostDetail'
import QnaPostWrite from './pages/QnaPost/QnaPostWrite'
import QnaPostEdit from './pages/QnaPost/QnaPostEdit'
import TipPostList from './pages/TipPost/TipPostList'
import TipPostDetail from './pages/TipPost/TipPostDetail'
import TipPostWrite from './pages/TipPost/TipPostWrite'
import TipPostEdit from './pages/TipPost/TipPostEdit'
import MainPage from './pages/Main/MainPage'
import MyPage from './pages/MyPage/MyPage'
import EditInfoPage from './pages/MyPage/EditInfoPage'
import MyPostList from './pages/MyPage/MyPostList'
import MyCommentList from './pages/MyPage/MyCommentList'
import Bookmarked from './pages/MyPage/Bookmarked'
import AdminDashboardPage from './pages/AdminPage/AdminDashboardPage'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App(): JSX.Element {
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || ''
    notificationSSE.start(token)
    return () => notificationSSE.stop()
  }, [])
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/main" element={<MainPage />} />
        <Route path="/free" element={<FreePostList />} />
        <Route path="/free/:id" element={<FreePostDetail />} />
        <Route path="/free/write" element={<FreePostWrite />} />
        <Route path="/free/edit/:id" element={<FreePostEdit />} />
        <Route path="/qna" element={<QnaPostList />} />
        <Route path="/qna/:postId" element={<QnaPostDetail />} />
        <Route path="/qna/write" element={<QnaPostWrite />} />
        <Route path="/qna/edit/:postId" element={<QnaPostEdit />} />
        <Route path="/tip" element={<TipPostList />} />
        <Route path="/tip/:id" element={<TipPostDetail />} />
        <Route path="/tip/write" element={<TipPostWrite />} />
        <Route path="/tip/edit/:id" element={<TipPostEdit />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/posts" element={<MyPostList />} />
        <Route path="/mypage/comments" element={<MyCommentList />} />
        <Route path="/mypage/bookmarked" element={<Bookmarked />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/mypage/edit-info" element={<EditInfoPage />} />
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
      />
    </Router>
  )
}

export default App
