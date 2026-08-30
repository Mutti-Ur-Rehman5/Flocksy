import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import KidsSignup from './pages/KidsSignup'
import OtpEntryScreen from './pages/OtpEntryScreen'
import Home from './pages/Home'
import { useDispatch, useSelector } from 'react-redux'
import getCurrentUser from './hooks/getCurrentUser'
import getSuggestedUsers from './hooks/getSuggestedUsers'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Upload from './pages/Upload'
import getAllPost from './hooks/getAllPost'
import Loops from './pages/Loops'
import getAllLoops from './hooks/getAllLoops'
import Story from './pages/Story'
import getAllStories from './hooks/getAllStories'
import Messages from './pages/Messages'
import MessageArea from './pages/MessageArea'
import {io} from "socket.io-client"
import { setOnlineUsers, setSocket } from './redux/socketSlice'
import getFollowingList from './hooks/getFollowingList'
import getPrevChatUsers from './hooks/getPrevChatUsers'
import Search from './pages/Search'
import getAllNotifications from './hooks/getAllNotifications'
import Notifications from './pages/Notifications'
import KidsLogin from './pages/KidsLogin'
import KidsHome from './pages/kids/KidsHome'
import KidsStoryReader from './pages/kids/KidsStoryReader'
import KidsQuiz from './pages/kids/KidsQuiz'
import KidsCanvas from './pages/kids/KidsCanvas'
import KidsRewards from './pages/kids/KidsRewards'
import KidsGames from './pages/kids/KidsGames'
import GuessTheAnimal from './pages/kids/KidsGames/GuessTheAnimal'
import TrueFalse from './pages/kids/KidsGames/TrueFalse'
import KidsLeaderboard from './pages/kids/KidsLeaderboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminKidsContent from './pages/admin/AdminKidsContent'
import AdminFlaggedChat from './pages/admin/AdminFlaggedChat'
import AdminOtpAudit from './pages/admin/AdminOtpAudit'
import AdminLogin from './pages/admin/AdminLogin'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAdultContent from './pages/admin/AdminAdultContent'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import { setNotificationData } from './redux/userSlice'
export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"
function App() {
   getCurrentUser()
   getSuggestedUsers()
   getAllPost()
   getAllLoops()
   getAllStories()
   getFollowingList()
   getPrevChatUsers()
   getAllNotifications()
  const {userData,notificationData}=useSelector(state=>state.user)
   
    const {socket}=useSelector(state=>state.socket)
    const dispatch=useDispatch()
 useEffect(()=>{
  if(userData){
    const socketIo=io(`${serverUrl}`,{
      query:{
        userId:userData._id
      }
    })
dispatch(setSocket(socketIo))


socketIo.on('getOnlineUsers',(users)=>{
  dispatch(setOnlineUsers(users))
  console.log(users)
})


return ()=>socketIo.close()
  }else{
    if(socket){
      socket.close()
      dispatch(setSocket(null))
    }
  }
 },[userData])


socket?.on("newNotification",(noti)=>{
  dispatch(setNotificationData([...notificationData,noti]))
})

  return (
    <Routes>
      <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
       <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
        <Route path='/' element={!userData?<Navigate to={"/signin"}/>:userData.role==="ADMIN"?<Navigate to={"/admin"}/>:userData.role==="CHILD"?<Navigate to={"/kids"}/>:<Home/>}/>
       <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
        <Route path='/kids-signup' element={!userData?<KidsSignup/>:(userData.role==="CHILD"?<Navigate to={"/kids"}/>:<Navigate to={"/"}/>)}/>
        <Route path='/kids/login' element={!userData?<KidsLogin/>:(userData.role==="CHILD"?<Navigate to={"/kids"}/>:<Navigate to={"/"}/>)}/>
        <Route path='/admin/login' element={!userData?<AdminLogin/>:(userData.role==="ADMIN"?<Navigate to={"/admin"}/>:<Navigate to={"/"}/>)}/>
        <Route path='/otp-verify' element={userData?<OtpEntryScreen/>:<Navigate to={"/signin"}/>}/>
      <Route path='/profile/:userName' element={userData?<Profile/>:<Navigate to={"/signin"}/>}/>
      <Route path='/story/:userName' element={userData?<Story/>:<Navigate to={"/signin"}/>}/>
       <Route path='/upload' element={userData?<Upload/>:<Navigate to={"/signin"}/>}/>
        <Route path='/search' element={userData?<Search/>:<Navigate to={"/signin"}/>}/>
          <Route path='/editprofile' element={userData?<EditProfile/>:<Navigate to={"/signin"}/>}/>
            <Route path='/messages' element={userData?<Messages/>:<Navigate to={"/signin"}/>}/>
            <Route path='/messageArea' element={userData?<MessageArea/>:<Navigate to={"/signin"}/>}/>
             <Route path='/notifications' element={userData?<Notifications/>:<Navigate to={"/signin"}/>}/>
           <Route path='/loops' element={userData?<Loops/>:<Navigate to={"/signin"}/>}/>
           {/* Kids Mode Routes */}
           <Route path='/kids' element={userData?<KidsHome/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/stories' element={userData?<KidsStoryReader/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/quiz' element={userData?<KidsQuiz/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/games' element={userData?<KidsGames/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/games/animal' element={userData?<GuessTheAnimal/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/games/true-false' element={userData?<TrueFalse/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/canvas' element={userData?<KidsCanvas/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/rewards' element={userData?<KidsRewards/>:<Navigate to={"/signin"}/>}/>
           <Route path='/kids/leaderboard' element={userData?<KidsLeaderboard/>:<Navigate to={"/signin"}/>}/>
           {/* Admin Routes */}
           <Route path='/admin' element={userData?.role==="ADMIN"?<AdminDashboard/>:<Navigate to={"/"}/>}/>
           <Route path='/admin/content' element={userData?.role==="ADMIN"?<AdminKidsContent/>:<Navigate to={"/"}/>}/>
           <Route path='/admin/flagged-chat' element={userData?.role==="ADMIN"?<AdminFlaggedChat/>:<Navigate to={"/"}/>}/>
            <Route path='/admin/otp-audit' element={userData?.role==="ADMIN"?<AdminOtpAudit/>:<Navigate to={"/"}/>}/>
            <Route path='/admin/users' element={userData?.role==="ADMIN"?<AdminUsers/>:<Navigate to={"/"}/>}/>
            <Route path='/admin/adult-content' element={userData?.role==="ADMIN"?<AdminAdultContent/>:<Navigate to={"/"}/>}/>
            <Route path='/admin/analytics' element={userData?.role==="ADMIN"?<AdminAnalytics/>:<Navigate to={"/"}/>}/>
    </Routes>
  )
}

export default App
