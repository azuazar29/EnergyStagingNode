(this.webpackJsonpEnergyApp=this.webpackJsonpEnergyApp||[]).push([[16],{226:function(t,e,r){"use strict";r.d(e,"d",(function(){return s})),r.d(e,"a",(function(){return u})),r.d(e,"b",(function(){return l})),r.d(e,"f",(function(){return p})),r.d(e,"g",(function(){return d})),r.d(e,"e",(function(){return f})),r.d(e,"c",(function(){return h}));var n=r(13),a=r.n(n),o=r(21),i=r(14),c=r(76);function s(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/Product/GetProductsList").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.p,data:r.payload});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}function u(t,e){return function(){var r=Object(o.a)(a.a.mark((function r(n){return a.a.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:c.a.post("/Product",e).then(function(){var e=Object(o.a)(a.a.mark((function e(r){return a.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:!0===r.isSuccess?(t.props.history.push("/admin/products"),n({type:i.a,data:!0}),t.setState({loading:!1}),n({type:i.b,data:!0,message:"Product Added",severity:"success"})):!1===r.isSuccess&&(t.setState({loading:!1}),n({type:i.b,data:!0,message:r.message,severity:"error"}));case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()).catch((function(e){t.setState({loading:!1}),n({type:i.b,data:!0,message:e.message,severity:"error"})}));case 1:case"end":return r.stop()}}),r)})));return function(t){return r.apply(this,arguments)}}()}function l(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/Product/GetPopularProducts").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.o,data:r.payload});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}function p(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/DropDown/GetDropDownList?Entity=Category").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.u,data:r.payload});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}function d(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/DropDown/GetDropDownList?Entity=Inventory").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.v,data:r.payload});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}function f(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/DropDown/GetDropDownList?Entity=Brands").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.s,data:r.payload});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}function h(){return function(){var t=Object(o.a)(a.a.mark((function t(e){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:c.a.get("/Product/GetProductBrandSegmentation").then(function(){var t=Object(o.a)(a.a.mark((function t(r){return a.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:!0===r.isSuccess&&e({type:i.t,data:r.chartData});case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}());case 1:case"end":return t.stop()}}),t)})));return function(e){return t.apply(this,arguments)}}()}},264:function(t,e,r){"use strict";r.r(e),r.d(e,"default",(function(){return S}));var n=r(8),a=r(41),o=r(42),i=r(59),c=r(44),s=r(43),u=r(0),l=r(34),p=r(239),d=r(58),f=r(232),h=r(216),x=r(233),j=r(250),m=r(198),g=r(7),b=r(50),y=r(260),v=r(226),C=r(3),O=function(t){Object(c.a)(r,t);var e=Object(s.a)(r);function r(t){var n;return Object(a.a)(this,r),(n=e.call(this,t)).dragOver=function(t){t.preventDefault()},n.dragEnter=function(t){t.preventDefault()},n.dragLeave=function(t){t.preventDefault()},n.fileDrop=function(t){t.preventDefault();var e=t.dataTransfer.files,r=e[0];if("object"===typeof r){var a=new FileReader;a.readAsDataURL(r),a.onloadend=function(t){this.setState({imgSrc:[a.result]})}.bind(Object(i.a)(n)),n.setState({file:e[0]})}},n.fileHandler=function(t){var e=t.target.files[0];if("object"===typeof e){var r=new FileReader;r.readAsDataURL(e),r.onloadend=function(t){this.setState({imgSrc:[r.result]})}.bind(Object(i.a)(n)),n.setState({file:t.target.files[0]})}},n.submit=function(){var t=n.state,e=t.productName,r=t.quantity,a=t.price,o=t.productCode,c=t.manufacturer,s=t.productSKU,u=t.productTax,l=t.coolingCapacity,p=t.powerConsumption,d=t.currentRating,f=t.efficiencyProfile,h=t.productCategoryId,x=t.Costprice,j={};j.productName=e,j.quantity=r,j.price=a,j.productCode=o,j.manufacturer=c,j.productSKU=s,j.productTax=u,j.coolingCapacity=l,j.powerConsumption=p,j.currentRating=d,j.fcuCapacity=d,j.efficiencyProfile=f,j.productCategoryId=h,j.Costprice=x,n.setState({loading:!0}),n.props.dispatch(Object(v.a)(Object(i.a)(n),j))},n.state={productName:"",quantity:"",price:"",productCode:"",manufacturer:"",productSKU:"",productTax:"",coolingCapacity:"",powerConsumption:"",currentRating:"",fcuCapacity:"",efficiencyProfile:"",productCategoryId:"",Costprice:"",productName_error:!1,quantity_error:!1,price_error:!1,productCode_error:!1,manufacturer_error:!1,productSKU_error:!1,productTax_error:!1,coolingCapacity_error:!1,powerConsumption_error:!1,currentRating_error:!1,fcuCapacity_error:!1,efficiencyProfile_error:!1,productCategoryId_error:!1,Costprice_error:!1,file:null,imgSrc:null,loading:!1},n}return Object(o.a)(r,[{key:"render",value:function(){var t=this,e=this.props.classes;return Object(C.jsxs)("div",{className:e.root,children:[Object(C.jsxs)(p.a,{separator:Object(C.jsx)(b.b,{size:15}),"aria-label":"breadcrumb",children:[Object(C.jsx)(d.a,{onClick:function(){return t.props.history.push("/admin/products")},style:{fontFamily:"SourceSansPro-Regular",color:"#1B1B1B",cursor:"pointer",fontSize:15},color:"primary",children:"Products"}),Object(C.jsx)(d.a,{style:{fontFamily:"SourceSansPro-Regular"},color:"textPrimary",children:"Add New Product"})]}),Object(C.jsxs)("div",{className:e.paper,children:[Object(C.jsx)(d.a,{className:e.title,children:"Basic Information"}),Object(C.jsxs)(f.a,{container:!0,spacing:2,children:[Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Product Name"}),Object(C.jsx)(h.a,{placeholder:"Enter Product Name",variant:"filled",onChange:function(e){return t.setState({productName:e.target.value,productName_error:!1,error_text:null})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Category"}),Object(C.jsxs)(h.a,{variant:"filled",value:this.state.productCategoryId,onChange:function(e){return t.setState({productCategoryId:e.target.value,productCategoryId_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,select:!0,SelectProps:{native:!0},autoComplete:"off",error:!!this.state.productCategoryId_error,helperText:!!this.state.productCategoryId_error&&"Please enter product category",children:[Object(C.jsx)("option",{value:"",disabled:!0,style:{fontFamily:"SourceSansPro-Regular"},children:"Select"}),Object(C.jsx)("option",{value:"1",style:{fontFamily:"SourceSansPro-Regular"},children:"Electric"}),Object(C.jsx)("option",{value:"2",style:{fontFamily:"SourceSansPro-Regular"},children:"Energy"}),Object(C.jsx)("option",{value:"3",style:{fontFamily:"SourceSansPro-Regular"},children:"Condenser"}),Object(C.jsx)("option",{value:"4",style:{fontFamily:"SourceSansPro-Regular"},children:"FCU"})]})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Product Code"}),Object(C.jsx)(h.a,{placeholder:"Enter Product Code",variant:"filled",value:this.state.productCode,onChange:function(e){return t.setState({productCode:e.target.value,productCode_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Product SKU"}),Object(C.jsx)(h.a,{placeholder:"Enter Product SKU",variant:"filled",value:this.state.productSKU,onChange:function(e){return t.setState({productSKU:e.target.value,productSKU_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Manufacturer"}),Object(C.jsx)(h.a,{placeholder:"Enter Brand Name",variant:"filled",value:this.state.manufacturer,onChange:function(e){return t.setState({manufacturer:e.target.value,manufacturer_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Quantity"}),Object(C.jsx)(h.a,{placeholder:"Enter Qunatity",variant:"filled",value:this.state.quantity,onChange:function(e){return t.setState({quantity:e.target.value,quantity_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Price"}),Object(C.jsx)(h.a,{placeholder:"Enter Product price",variant:"filled",value:this.state.price,onChange:function(e){return t.setState({price:e.target.value,price_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Tax(%)"}),Object(C.jsx)(h.a,{placeholder:"Enter tax",variant:"filled",value:this.state.productTax,onChange:function(e){return t.setState({productTax:e.target.value,productTax_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Cooling Capacity"}),Object(C.jsx)(h.a,{placeholder:"Enter Cooling Capacity",variant:"filled",value:this.state.coolingCapacity,onChange:function(e){return t.setState({coolingCapacity:e.target.value,coolingCapacity_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Power Consumption"}),Object(C.jsx)(h.a,{placeholder:"Enter Power Consumption",variant:"filled",value:this.state.powerConsumption,onChange:function(e){return t.setState({powerConsumption:e.target.value,powerConsumption_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Current Rating"}),Object(C.jsx)(h.a,{placeholder:"Enter Current Rating",variant:"filled",value:this.state.currentRating,onChange:function(e){return t.setState({currentRating:e.target.value,currentRating_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"FCU Capacities"}),Object(C.jsx)(h.a,{placeholder:"Enter FCU Capacities",variant:"filled",value:this.state.fcuCapacity,onChange:function(e){return t.setState({fcuCapacity:e.target.value,fcuCapacity_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Effiency Profile"}),Object(C.jsx)(h.a,{placeholder:"Enter Effiency Profile",variant:"filled",value:this.state.efficiencyProfile,onChange:function(e){return t.setState({efficiencyProfile:e.target.value,efficiencyProfile_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,sm:6,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Cost Price"}),Object(C.jsx)(h.a,{placeholder:"Enter Cost price",variant:"filled",value:this.state.Costprice,onChange:function(e){return t.setState({Costprice:e.target.value,Costprice_error:!1})},InputProps:{classes:{input:e.inputStyle,underline:e.underline,root:e.inputRoot}},fullWidth:!0,autoComplete:"off"})]}),Object(C.jsxs)(f.a,{item:!0,xs:12,children:[Object(C.jsx)(d.a,{className:e.textFiledText,children:"Tags"}),Object(C.jsx)(y.a,{multiple:!0,id:"tags-outlined",className:e.autoComplete,options:[{title:"tag1",year:1921},{title:"tag2",year:2009},{title:"tag3",year:2e3},{title:"tag4",year:2009},{title:"tag5",year:1975}],getOptionLabel:function(t){return t.title},filterSelectedOptions:!0,renderInput:function(t){return Object(C.jsx)(h.a,Object(n.a)(Object(n.a)({},t),{},{variant:"outlined",placeholder:"Select"}))}})]}),Object(C.jsx)(f.a,{item:!0,xs:12,children:null!==this.state.file?Object(C.jsxs)("div",{className:e.dragContainer,style:{display:"block",height:150},children:[Object(C.jsx)("div",{children:Object(C.jsx)("img",{src:this.state.imgSrc,alt:"org",width:100,height:"auto"})}),Object(C.jsxs)("div",{children:[Object(C.jsx)("input",{accept:"image/*",className:e.inputimage,id:"text-button-file1",multiple:!0,type:"file",onChange:this.fileHandler}),Object(C.jsx)("label",{htmlFor:"text-button-file1",children:Object(C.jsx)(x.a,{component:"span",variant:"contained",className:e.uploadButton,children:"Change"})})]})]}):Object(C.jsxs)("div",{className:e.dragContainer,onDragOver:this.dragOver,onDragEnter:this.dragEnter,onDragLeave:this.dragLeave,onDrop:this.fileDrop,children:[Object(C.jsx)(d.a,{style:{fontSize:14,color:"#000",padding:"10px 0px",fontFamily:"SourceSansPro-Regular"},children:"Drag and drop files here"}),Object(C.jsx)(d.a,{style:{fontSize:13,color:"#666666",fontFamily:"SourceSansPro-Regular"},children:"or"}),Object(C.jsx)("input",{accept:"image/*",className:e.inputimage,id:"text-button-file1",multiple:!0,type:"file",onChange:this.fileHandler}),Object(C.jsx)("label",{htmlFor:"text-button-file1",children:Object(C.jsx)(x.a,{component:"span",variant:"contained",className:e.uploadButton,children:"Upload"})})]})})]}),Object(C.jsx)("div",{style:{width:"100%",display:"flex",justifyContent:"flex-end",marginTop:15},children:Object(C.jsx)(x.a,{variant:"contained",className:e.buttonVariant,onClick:function(){return t.submit()},children:"Create Product"})})]}),Object(C.jsx)(j.a,{open:this.state.loading,classes:{paper:e.dialogPaper},children:Object(C.jsx)("div",{style:{boxShadow:0,overflow:"none"},children:Object(C.jsx)(m.a,{color:"primary",size:50})})})]})}}]),r}(u.Component),S=Object(l.b)((function(){return{}}))(Object(g.a)((function(t){return{root:{padding:t.spacing(4)},paper:{backgroundColor:"#fff",marginTop:15,padding:t.spacing(2)},title:{fontSize:16,color:"#000",fontWeight:"bold",margin:"10px 0px 20px",fontFamily:"SourceSansPro-Regular"},textFiledText:{fontSize:13,padding:"5px 0px",color:"#000",fontFamily:"SourceSansPro-Regular"},inputRoot:{backgroundColor:"#FFFFFF",border:"1px solid #E1E7ED",borderRadius:"4px",fontSize:"13x !important",fontFamily:"SourceSansPro-Regular","&:hover":{border:"1px solid #1B1B1B",backgroundColor:"#FFFFFF"}},inputStyle:{fontFamily:"SourceSansPro-Regular !important",fontSize:"13x !important",padding:"10px !important",color:"#1B1B1B",opacity:1,"&&:after":{color:"#1B1B1B"}},underline:{"&&&:before":{borderBottom:"none"},"&&:after":{borderBottom:"none"}},dragContainer:{width:"97%",height:100,padding:15,border:"1px solid #cccccc",backgroundColor:"#FAFAFA",textAlign:"center",fontFamily:"SourceSansPro-Regular"},buttonVariant:{boxShadow:"0px 0px 0px 0px #E1E7ED",backgroundColor:"#1B1B1B",margin:"5px 0px",color:"#fff",borderRadius:6,fontSize:14,padding:"5px 20px",height:"fit-content",textTransform:"none",fontFamily:"SourceSansPro-Regular","&:hover":{backgroundColor:"#1B1B1B"}},uploadButton:{boxShadow:"0px 0px 0px 0px #E1E7ED",backgroundColor:"#cccccc",margin:"10px 0px 25px",color:"#000",borderRadius:0,fontSize:14,padding:"3px 20px",height:"fit-content",textTransform:"none",fontFamily:"SourceSansPro-Regular","&:hover":{backgroundColor:"#cccccc"}},inputimage:{display:"none"},dialogPaper:{backgroundColor:"rgba(0,0,0,0)",boxShadow:"none",overflow:"hidden"}}}))(O))}}]);
//# sourceMappingURL=16.4c14ae51.chunk.js.map