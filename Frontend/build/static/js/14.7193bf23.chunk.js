(this.webpackJsonpEnergyApp=this.webpackJsonpEnergyApp||[]).push([[14],{232:function(e,t,a){"use strict";var r=a(4),o=a(2),n=a(0),i=(a(6),a(5)),s=a(7),l=[0,1,2,3,4,5,6,7,8,9,10],c=["auto",!0,1,2,3,4,5,6,7,8,9,10,11,12];function d(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,a=parseFloat(e);return"".concat(a/t).concat(String(e).replace(String(a),"")||"px")}var p=n.forwardRef((function(e,t){var a=e.alignContent,s=void 0===a?"stretch":a,l=e.alignItems,c=void 0===l?"stretch":l,d=e.classes,p=e.className,u=e.component,m=void 0===u?"div":u,x=e.container,b=void 0!==x&&x,g=e.direction,h=void 0===g?"row":g,f=e.item,v=void 0!==f&&f,y=e.justify,j=e.justifyContent,S=void 0===j?"flex-start":j,w=e.lg,C=void 0!==w&&w,O=e.md,k=void 0!==O&&O,N=e.sm,z=void 0!==N&&N,_=e.spacing,R=void 0===_?0:_,E=e.wrap,I=void 0===E?"wrap":E,T=e.xl,P=void 0!==T&&T,F=e.xs,W=void 0!==F&&F,V=e.zeroMinWidth,B=void 0!==V&&V,$=Object(r.a)(e,["alignContent","alignItems","classes","className","component","container","direction","item","justify","justifyContent","lg","md","sm","spacing","wrap","xl","xs","zeroMinWidth"]),A=Object(i.a)(d.root,p,b&&[d.container,0!==R&&d["spacing-xs-".concat(String(R))]],v&&d.item,B&&d.zeroMinWidth,"row"!==h&&d["direction-xs-".concat(String(h))],"wrap"!==I&&d["wrap-xs-".concat(String(I))],"stretch"!==c&&d["align-items-xs-".concat(String(c))],"stretch"!==s&&d["align-content-xs-".concat(String(s))],"flex-start"!==(y||S)&&d["justify-content-xs-".concat(String(y||S))],!1!==W&&d["grid-xs-".concat(String(W))],!1!==z&&d["grid-sm-".concat(String(z))],!1!==k&&d["grid-md-".concat(String(k))],!1!==C&&d["grid-lg-".concat(String(C))],!1!==P&&d["grid-xl-".concat(String(P))]);return n.createElement(m,Object(o.a)({className:A,ref:t},$))})),u=Object(s.a)((function(e){return Object(o.a)({root:{},container:{boxSizing:"border-box",display:"flex",flexWrap:"wrap",width:"100%"},item:{boxSizing:"border-box",margin:"0"},zeroMinWidth:{minWidth:0},"direction-xs-column":{flexDirection:"column"},"direction-xs-column-reverse":{flexDirection:"column-reverse"},"direction-xs-row-reverse":{flexDirection:"row-reverse"},"wrap-xs-nowrap":{flexWrap:"nowrap"},"wrap-xs-wrap-reverse":{flexWrap:"wrap-reverse"},"align-items-xs-center":{alignItems:"center"},"align-items-xs-flex-start":{alignItems:"flex-start"},"align-items-xs-flex-end":{alignItems:"flex-end"},"align-items-xs-baseline":{alignItems:"baseline"},"align-content-xs-center":{alignContent:"center"},"align-content-xs-flex-start":{alignContent:"flex-start"},"align-content-xs-flex-end":{alignContent:"flex-end"},"align-content-xs-space-between":{alignContent:"space-between"},"align-content-xs-space-around":{alignContent:"space-around"},"justify-content-xs-center":{justifyContent:"center"},"justify-content-xs-flex-end":{justifyContent:"flex-end"},"justify-content-xs-space-between":{justifyContent:"space-between"},"justify-content-xs-space-around":{justifyContent:"space-around"},"justify-content-xs-space-evenly":{justifyContent:"space-evenly"}},function(e,t){var a={};return l.forEach((function(r){var o=e.spacing(r);0!==o&&(a["spacing-".concat(t,"-").concat(r)]={margin:"-".concat(d(o,2)),width:"calc(100% + ".concat(d(o),")"),"& > $item":{padding:d(o,2)}})})),a}(e,"xs"),e.breakpoints.keys.reduce((function(t,a){return function(e,t,a){var r={};c.forEach((function(e){var t="grid-".concat(a,"-").concat(e);if(!0!==e)if("auto"!==e){var o="".concat(Math.round(e/12*1e8)/1e6,"%");r[t]={flexBasis:o,flexGrow:0,maxWidth:o}}else r[t]={flexBasis:"auto",flexGrow:0,maxWidth:"none"};else r[t]={flexBasis:0,flexGrow:1,maxWidth:"100%"}})),"xs"===a?Object(o.a)(e,r):e[t.breakpoints.up(a)]=r}(t,e,a),t}),{}))}),{name:"MuiGrid"})(p);t.a=u},233:function(e,t,a){"use strict";var r=a(4),o=a(2),n=a(0),i=(a(6),a(5)),s=a(7),l=a(23),c=a(115),d=a(11),p=n.forwardRef((function(e,t){var a=e.children,s=e.classes,l=e.className,p=e.color,u=void 0===p?"default":p,m=e.component,x=void 0===m?"button":m,b=e.disabled,g=void 0!==b&&b,h=e.disableElevation,f=void 0!==h&&h,v=e.disableFocusRipple,y=void 0!==v&&v,j=e.endIcon,S=e.focusVisibleClassName,w=e.fullWidth,C=void 0!==w&&w,O=e.size,k=void 0===O?"medium":O,N=e.startIcon,z=e.type,_=void 0===z?"button":z,R=e.variant,E=void 0===R?"text":R,I=Object(r.a)(e,["children","classes","className","color","component","disabled","disableElevation","disableFocusRipple","endIcon","focusVisibleClassName","fullWidth","size","startIcon","type","variant"]),T=N&&n.createElement("span",{className:Object(i.a)(s.startIcon,s["iconSize".concat(Object(d.a)(k))])},N),P=j&&n.createElement("span",{className:Object(i.a)(s.endIcon,s["iconSize".concat(Object(d.a)(k))])},j);return n.createElement(c.a,Object(o.a)({className:Object(i.a)(s.root,s[E],l,"inherit"===u?s.colorInherit:"default"!==u&&s["".concat(E).concat(Object(d.a)(u))],"medium"!==k&&[s["".concat(E,"Size").concat(Object(d.a)(k))],s["size".concat(Object(d.a)(k))]],f&&s.disableElevation,g&&s.disabled,C&&s.fullWidth),component:x,disabled:g,focusRipple:!y,focusVisibleClassName:Object(i.a)(s.focusVisible,S),ref:t,type:_},I),n.createElement("span",{className:s.label},T,a,P))}));t.a=Object(s.a)((function(e){return{root:Object(o.a)({},e.typography.button,{boxSizing:"border-box",minWidth:64,padding:"6px 16px",borderRadius:e.shape.borderRadius,color:e.palette.text.primary,transition:e.transitions.create(["background-color","box-shadow","border"],{duration:e.transitions.duration.short}),"&:hover":{textDecoration:"none",backgroundColor:Object(l.a)(e.palette.text.primary,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"},"&$disabled":{backgroundColor:"transparent"}},"&$disabled":{color:e.palette.action.disabled}}),label:{width:"100%",display:"inherit",alignItems:"inherit",justifyContent:"inherit"},text:{padding:"6px 8px"},textPrimary:{color:e.palette.primary.main,"&:hover":{backgroundColor:Object(l.a)(e.palette.primary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},textSecondary:{color:e.palette.secondary.main,"&:hover":{backgroundColor:Object(l.a)(e.palette.secondary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},outlined:{padding:"5px 15px",border:"1px solid ".concat("light"===e.palette.type?"rgba(0, 0, 0, 0.23)":"rgba(255, 255, 255, 0.23)"),"&$disabled":{border:"1px solid ".concat(e.palette.action.disabledBackground)}},outlinedPrimary:{color:e.palette.primary.main,border:"1px solid ".concat(Object(l.a)(e.palette.primary.main,.5)),"&:hover":{border:"1px solid ".concat(e.palette.primary.main),backgroundColor:Object(l.a)(e.palette.primary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}}},outlinedSecondary:{color:e.palette.secondary.main,border:"1px solid ".concat(Object(l.a)(e.palette.secondary.main,.5)),"&:hover":{border:"1px solid ".concat(e.palette.secondary.main),backgroundColor:Object(l.a)(e.palette.secondary.main,e.palette.action.hoverOpacity),"@media (hover: none)":{backgroundColor:"transparent"}},"&$disabled":{border:"1px solid ".concat(e.palette.action.disabled)}},contained:{color:e.palette.getContrastText(e.palette.grey[300]),backgroundColor:e.palette.grey[300],boxShadow:e.shadows[2],"&:hover":{backgroundColor:e.palette.grey.A100,boxShadow:e.shadows[4],"@media (hover: none)":{boxShadow:e.shadows[2],backgroundColor:e.palette.grey[300]},"&$disabled":{backgroundColor:e.palette.action.disabledBackground}},"&$focusVisible":{boxShadow:e.shadows[6]},"&:active":{boxShadow:e.shadows[8]},"&$disabled":{color:e.palette.action.disabled,boxShadow:e.shadows[0],backgroundColor:e.palette.action.disabledBackground}},containedPrimary:{color:e.palette.primary.contrastText,backgroundColor:e.palette.primary.main,"&:hover":{backgroundColor:e.palette.primary.dark,"@media (hover: none)":{backgroundColor:e.palette.primary.main}}},containedSecondary:{color:e.palette.secondary.contrastText,backgroundColor:e.palette.secondary.main,"&:hover":{backgroundColor:e.palette.secondary.dark,"@media (hover: none)":{backgroundColor:e.palette.secondary.main}}},disableElevation:{boxShadow:"none","&:hover":{boxShadow:"none"},"&$focusVisible":{boxShadow:"none"},"&:active":{boxShadow:"none"},"&$disabled":{boxShadow:"none"}},focusVisible:{},disabled:{},colorInherit:{color:"inherit",borderColor:"currentColor"},textSizeSmall:{padding:"4px 5px",fontSize:e.typography.pxToRem(13)},textSizeLarge:{padding:"8px 11px",fontSize:e.typography.pxToRem(15)},outlinedSizeSmall:{padding:"3px 9px",fontSize:e.typography.pxToRem(13)},outlinedSizeLarge:{padding:"7px 21px",fontSize:e.typography.pxToRem(15)},containedSizeSmall:{padding:"4px 10px",fontSize:e.typography.pxToRem(13)},containedSizeLarge:{padding:"8px 22px",fontSize:e.typography.pxToRem(15)},sizeSmall:{},sizeLarge:{},fullWidth:{width:"100%"},startIcon:{display:"inherit",marginRight:8,marginLeft:-4,"&$iconSizeSmall":{marginLeft:-2}},endIcon:{display:"inherit",marginRight:-4,marginLeft:8,"&$iconSizeSmall":{marginRight:-2}},iconSizeSmall:{"& > *:first-child":{fontSize:18}},iconSizeMedium:{"& > *:first-child":{fontSize:20}},iconSizeLarge:{"& > *:first-child":{fontSize:22}}}}),{name:"MuiButton"})(p)},268:function(e,t,a){"use strict";a.r(t),a.d(t,"default",(function(){return w}));var r=a(41),o=a(42),n=a(59),i=a(44),s=a(43),l=a(0),c=a(7),d=a(232),p=a(58),u=a(216),m=a(208),x=a(206),b=a(198),g=a(233),h=a(34),f=a(48),v=a(50),y=a(85),j=a(3),S=function(e){Object(i.a)(a,e);var t=Object(s.a)(a);function a(){var e;return Object(r.a)(this,a),(e=t.call(this)).componentDidMount=function(){var t=localStorage.getItem("user_token");null!==t&&void 0!==t&&"null"!==t&&e.props.history.push("/admin/dashboard")},e.passwordValidation=function(e){return/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(\S){8,}$/.test(e)},e.submit=function(){var t=!1,a=e.state,r=a.firstName,o=a.lastName,i=a.email,s=a.password;if(""!==r&&null!==r&&void 0!==r||(e.setState({firstName_error:!0}),t=!0),""!==o&&null!==o&&void 0!==o||(e.setState({lastName_error:!0}),t=!0),""===i||null===i||void 0===i?(e.setState({email_error:!0}),t=!0):e.validateEmail(i)||(e.setState({invalid_email_error:!0}),t=!0),""===s||null===s||void 0===s?(e.setState({password_error:!0}),t=!0):e.passwordValidation(s)||(e.setState({invalid_password_error:!0}),t=!0),!1===t){var l={};l.email=i,l.password=s,l.firstName=r,l.lastName=o,e.setState({loading:!0}),e.props.dispatch(Object(y.c)(Object(n.a)(e),l))}},e.state={passwordVisible:!1,password:"",firstName:"",lastName:"",email:"",email_error:!1,password_error:!1,invalid_email_error:!1,invalid_password_error:!1,firstName_error:!1,lastName_error:!1,remember_me:!1,error_text:null,loading:!1},e}return Object(o.a)(a,[{key:"validateEmail",value:function(e){return/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e)}},{key:"render",value:function(){var e=this,t=this.props.classes;return Object(j.jsx)("div",{className:t.container,children:Object(j.jsx)("div",{style:{minHeight:"100vh",display:"flex",justifyContent:"center",alignItems:"center"},children:Object(j.jsx)(d.a,{container:!0,justifyContent:"center",alignItems:"center",children:Object(j.jsx)(d.a,{item:!0,xs:11,sm:7,md:3,children:Object(j.jsxs)("div",{className:t.card,children:[Object(j.jsx)(p.a,{className:t.cardTitle,children:"Sign up"}),Object(j.jsx)(p.a,{className:t.cardSecondTitle,children:"Create New Account"}),Object(j.jsx)("div",{className:t.textFieldContainer,children:Object(j.jsx)(u.a,{placeholder:"First Name",label:"First Name",color:"primary",value:this.state.firstName,onChange:function(t){return e.setState({firstName:t.target.value,firstName_error:!1})},InputProps:{classes:{input:t.inputStyle,underline:t.underline,root:t.inputRoot}},fullWidth:!0,autoComplete:"off",error:!!this.state.firstName_error,helperText:!!this.state.firstName_error&&"Please enter first name",onKeyPress:function(t){"Enter"===t.key&&e.submit()}})}),Object(j.jsx)("div",{className:t.textFieldContainer,children:Object(j.jsx)(u.a,{placeholder:"Last Name",label:"Last Name",color:"primary",value:this.state.lastName,onChange:function(t){return e.setState({lastName:t.target.value,lastName_error:!1})},InputProps:{classes:{input:t.inputStyle,underline:t.underline,root:t.inputRoot}},fullWidth:!0,autoComplete:"off",error:!!this.state.lastName_error,helperText:!!this.state.lastName_error&&"Please enter last name",onKeyPress:function(t){"Enter"===t.key&&e.submit()}})}),Object(j.jsx)("div",{className:t.textFieldContainer,children:Object(j.jsx)(u.a,{placeholder:"Email Address",label:"Email",type:"email",color:"primary",value:this.state.email,onChange:function(t){return e.setState({email:t.target.value,email_error:!1,invalid_email_error:!1,error_text:null})},InputProps:{classes:{input:t.inputStyle,underline:t.underline,root:t.inputRoot}},fullWidth:!0,autoComplete:"off",error:!!this.state.email_error||!!this.state.invalid_email_error,helperText:this.state.email_error?"Please enter email address":!!this.state.invalid_email_error&&"Invalid Email",onKeyPress:function(t){"Enter"===t.key&&e.submit()}})}),Object(j.jsx)("div",{className:t.textFieldContainer,children:Object(j.jsx)(u.a,{placeholder:"Enter Password",label:"Password",color:"primary",value:this.state.password,type:this.state.passwordVisible?"text":"password",onChange:function(t){return e.setState({password:t.target.value,password_error:!1,invalid_password_error:!1,error_text:null})},InputProps:{classes:{input:t.inputStyle,underline:t.underline,root:t.inputRoot},endAdornment:Object(j.jsx)(m.a,{position:"end",children:Object(j.jsx)(x.a,{"aria-label":"toggle password visibility",onClick:function(){return e.setState({passwordVisible:!e.state.passwordVisible})},children:this.state.passwordVisible?Object(j.jsx)(v.d,{size:16,color:"#57B78C"}):Object(j.jsx)(v.e,{size:16,color:"#57B78C"})})})},fullWidth:!0,autoComplete:"off",error:!!this.state.password_error||!!this.state.invalid_password_error,helperText:this.state.password_error?"Please enter password":!!this.state.invalid_password_error&&"Invalid Password",onKeyPress:function(t){"Enter"===t.key&&e.submit()}})}),null!==this.state.error_text&&Object(j.jsx)(p.a,{className:t.errorText,children:this.state.error_text}),Object(j.jsxs)("div",{style:{marginTop:60,marginBottom:10},children:[Object(j.jsx)(p.a,{className:t.linkText,children:"I forgot my password "}),Object(j.jsx)(p.a,{className:t.linkText,onClick:function(){return e.props.history.push("/")},children:"I already have an account"}),Object(j.jsx)(p.a,{className:t.linkText,children:"I can't log in "})]}),!0===this.state.loading?Object(j.jsx)("div",{style:{textAlign:"center"},children:Object(j.jsx)(b.a,{color:"primary",size:25})}):Object(j.jsx)(g.a,{fullWidth:!0,variant:"contained",className:t.buttonVariant,onClick:function(){return e.submit()},children:"Sign up"})]})})})})})}}]),a}(l.Component),w=Object(f.c)(Object(c.a)((function(e){return{container:{minHeight:"100vh",backgroundColor:"#eaeaea",backgroundRepeat:"no-repeat"},card:{border:"1px solid #E1E7ED",backgroundColor:"#FFFFFF",borderRadius:4,padding:40},inputRoot:{borderRadius:"4px",fontSize:"15x !important"},inputStyle:{fontSize:"15x !important",padding:"10px !important",color:"#6E8CA8",fontFamily:"SourceSansPro-Regular",opacity:1,"&&:after":{color:"#57B78C"}},underline:{"&&&:before":{borderBottom:"1px solid #cccccc"},"&&:after":{borderBottom:"1px solid #57B78C"}},textFieldContainer:{padding:"10px 0px"},buttonVariant:{boxShadow:"0px 0px 0px 0px #E1E7ED",backgroundColor:"#000",margin:"15px 0px",color:"#fff",borderRadius:6,fontSize:18,padding:"15px 20px",height:"fit-content",textTransform:"none",fontFamily:"SourceSansPro-Regular","&:hover":{backgroundColor:"#000"}},linkText:{fontSize:"14px !important",padding:"5px 5px",color:"#666666",cursor:"pointer",fontFamily:"SourceSansPro-Regular","&:hover":{textDecoration:"underline"}},errorText:{padding:10,fontSize:12,color:"#f44336",fontFamily:"SourceSansPro-Regular"},cardTitle:{textAlign:"left",color:"#000",fontWeight:"bold",fontSize:20,padding:"10px 0px 0px",fontFamily:"SourceSansPro-Regular"},cardSecondTitle:{textAlign:"left",color:"#666666",fontSize:17,padding:"10px 0px",fontFamily:"SourceSansPro-Regular"}}})),Object(h.b)((function(e){return{}})))(S)}}]);
//# sourceMappingURL=14.7193bf23.chunk.js.map