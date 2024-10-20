import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import "../Styles/Loadingpage.css";

function Loadingpage() {
  return (
    <div className="LoadingPage">
      <div className="LoadingPage_Names_Container">
        <p className="LoadingPage--BrideName">Alekhya</p>
        <FaHeart className="LoadingPage--Heart" size={100} />
        <p className="LoadingPage--GroomName">Dinesh</p>
      </div>
      <div className="LoadingPage_WelcomeMessage">
        <p>Welcome to our</p>
        <p>Engagement ceremony!</p>
      </div>
    </div>
  );
}

export default Loadingpage;
