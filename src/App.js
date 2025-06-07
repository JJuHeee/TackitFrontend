import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import FreePostList from './pages/FreePost/FreePostList'; 
import FreePostDetail from './pages/FreePost/FreePostDetail';
import FreePostWrite from './pages/FreePost/FreePostWrite';
import FreePostEdit from './pages/FreePost/FreePostEdit'; 
import QnaPostList from './pages/QnaPost/QnaPostList'; 
import QnaPostDetail from './pages/QnaPost/QnaPostDetail';
import QnaPostWrite from './pages/QnaPost/QnaPostWrite';
import QnaPostEdit from './pages/QnaPost/QnaPostEdit'; 
import TipPostList from './pages/TipPost/TipPostList'; 
import TipPostDetail from './pages/TipPost/TipPostDetail';
import TipPostWrite from './pages/TipPost/TipPostWrite';
import TipPostEdit from './pages/TipPost/TipPostEdit'; 
import MainPage from './pages/Main/MainPage'; 
import MyPage from './pages/MyPage/MyPage';
import EditPasswordPage from './pages/MyPage/EditPasswordPage';
import EditNicknamePage from './pages/MyPage/EditNicknamePage';
import UserManagementPage from './pages/MyPage/UserManagementPage';
import PostManagementPage from './pages/MyPage/PostManagementPage';
import MyFreePostList from './pages/MyPage/MyFreePostList';
import MyQnaPostList from './pages/MyPage/MyQnaPostList';
import MyTipPostList from './pages/MyPage/MyTipPostList';
import MyFreeComments from './pages/MyPage/MyFreeComments';
import MyQnaComments from './pages/MyPage/MyQnaComments';
import Bookmarked from './pages/MyPage/Bookmarked'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';






function App() {
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
        <Route path="/mypage/edit-password" element={<EditPasswordPage />} />
        <Route path="/mypage/edit-nickname" element={<EditNicknamePage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/report/:postType" element={<PostManagementPage />} />
        <Route path="/mypage/myfreeposts" element={<MyFreePostList />} /> 
        <Route path="/mypage/myqnaposts" element={<MyQnaPostList />} />
        <Route path="/mypage/mytipposts" element={<MyTipPostList />} />
        <Route path="/mypage/myfreecomments" element={<MyFreeComments />} />
        <Route path="/mypage/myqnacomments" element={<MyQnaComments />} />
        <Route path="/mypage/bookmarked" element={<Bookmarked />} /> 
  


        
      </Routes>

      <ToastContainer
        position="top-center"
        autoClose={1500}  
        hideProgressBar
        closeOnClick
        pauseOnHover={false}
      />

    </Router>
  );
}


export default App;
