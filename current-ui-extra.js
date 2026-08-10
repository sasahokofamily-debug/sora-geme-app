(()=>{
'use strict';
const VERSION='current-ui-extra-v1';
if(window.__SHOOKING_CURRENT_UI_EXTRA__===VERSION)return;
window.__SHOOKING_CURRENT_UI_EXTRA__=VERSION;

const style=document.createElement('style');
style.id='shookingCurrentUiExtraStyle';
style.textContent=`
#familyMessageSettings,#stageSelect,#shop,#modEditor,#requestLog,#questScreen,#progressScreen,#skinChangeScreen,#missionReportScreen,#savedReportsScreen,#achievementScreen,#saveManagerScreen{
  background:radial-gradient(circle at 50% -12%,#112b4d 0,#071224 34%,#02050c 76%)!important;color:#eaf8ff!important
}
#familyMessageSettings>.panel,#stageSelect>.panel,#shop>.panel,#modEditor>.panel,#requestLog>.panel,#questScreen>.panel,#progressScreen>.panel,#skinChangeScreen>.panel,#missionReportScreen>.panel,#savedReportsScreen>.panel,#achievementScreen>.panel,#saveManagerScreen>.panel{
  width:min(1040px,94vw)!important;max-height:calc(100dvh - 34px)!important;padding:clamp(18px,2.5vw,34px)!important;
  border:1px solid #2d607e!important;border-radius:24px!important;background:linear-gradient(160deg,#07101f 0%,#030711 62%,#07101d 100%)!important;
  box-shadow:0 24px 70px #0009,0 0 30px #0ea5e933!important;text-align:left!important
}
#familyMessageSettings h1,#stageSelect h1,#shop h1,#modEditor h1,#requestLog h1,#questScreen h1,#progressScreen h1,#skinChangeScreen h1,#missionReportScreen h1,#savedReportsScreen h1,#achievementScreen h1,#saveManagerScreen h1{
  color:#effcff!important;font-size:clamp(30px,4vw,48px)!important;letter-spacing:.015em!important;text-shadow:0 0 22px #38bdf844!important;text-align:left!important;margin-bottom:22px!important
}
#familyMessageSettings h2,#stageSelect h2,#shop h2,#modEditor h2,#requestLog h2,#questScreen h2,#progressScreen h2,#skinChangeScreen h2,#missionReportScreen h2,#savedReportsScreen h2,#achievementScreen h2,#saveManagerScreen h2{color:#dffaff!important}
#familyMessageSettings input,#familyMessageSettings textarea,#familyMessageSettings select,#modEditor input,#modEditor textarea,#requestLog input,#questScreen input,#saveManagerScreen input,#saveManagerScreen textarea{
  border:1px solid #285875!important;border-radius:12px!important;background:#020913!important;color:#f4fbff!important;box-shadow:inset 0 0 18px #0ea5e908!important
}
#familyMessageSettings button,#stageSelect button,#shop button,#modEditor button,#requestLog button,#questScreen button,#progressScreen button,#skinChangeScreen button,#missionReportScreen button,#savedReportsScreen button,#achievementScreen button,#saveManagerScreen button{
  border:1px solid #2d5d79!important;border-radius:12px!important;background:linear-gradient(180deg,#12365a,#09223d)!important;color:#eefcff!important;
  box-shadow:inset 0 1px #ffffff12,0 8px 20px #0004!important;transition:transform .12s ease,filter .12s ease,border-color .12s ease!important
}
#familyMessageSettings button:hover,#stageSelect button:hover,#shop button:hover,#modEditor button:hover,#requestLog button:hover,#questScreen button:hover,#progressScreen button:hover,#skinChangeScreen button:hover,#missionReportScreen button:hover,#savedReportsScreen button:hover,#achievementScreen button:hover,#saveManagerScreen button:hover{
  transform:translateY(-1px);filter:brightness(1.12);border-color:#67e8f9!important
}
#familyMessageSettings .back,#stageSelect .back,#shop .back,#modEditor .back,#requestLog .back,#questScreen .back,#progressScreen .back,#skinChangeScreen .back,#missionReportScreen .back,#savedReportsScreen .back,#achievementScreen .back,#saveManagerScreen .back{
  background:#0b1422!important;color:#9db3c5!important;border-color:#26384b!important
}
#familyMessageSettings .authBox,#familyMessageSettings .dangerBox,#familyMessageSettings .familyMessageCard,#familyMessageSettings section,
#modEditor .authBox,#requestLog .logbox,#questScreen .authBox,#saveManagerScreen .authBox{
  border:1px solid #213d53!important;border-radius:16px!important;background:#0a1426!important;padding:18px!important;margin:14px 0!important;box-shadow:none!important
}
#familyMessageSettings .small{color:#9cb2c4!important;opacity:1!important}
#familyMessageSettings textarea{min-height:118px!important;line-height:1.55!important}
#familyMessageSettings label{display:block;margin:10px 0 4px;color:#afc5d6;font-weight:900;font-size:12px;letter-spacing:.04em}
#shop .choiceCard,#stageSelect .choiceCard,#achievementScreen .choiceCard,#skinChangeScreen .skinCard{
  border:1px solid #23465f!important;border-radius:16px!important;background:linear-gradient(145deg,#0a1729,#050b15)!important;box-shadow:none!important
}
#shop .choiceCard:hover,#stageSelect .choiceCard:hover{border-color:#67e8f9!important;background:#0c2037!important}
#requestLog .logbox,#savedReportsScreen .logbox,#missionReportScreen .logbox{background:#020812!important;border-color:#213d53!important}
@media(max-width:780px){
 #familyMessageSettings>.panel,#stageSelect>.panel,#shop>.panel,#modEditor>.panel,#requestLog>.panel,#questScreen>.panel,#progressScreen>.panel,#skinChangeScreen>.panel,#missionReportScreen>.panel,#savedReportsScreen>.panel,#achievementScreen>.panel,#saveManagerScreen>.panel{
   width:100%!important;max-height:none!important;border-radius:0!important;border-left:0!important;border-right:0!important;padding:16px!important
 }
}
`;
document.head.appendChild(style);
})();
