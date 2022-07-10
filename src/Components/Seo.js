import { Helmet } from "react-helmet";

function Seo(props) {
	return (
		<Helmet>
        {props.title ? (<title>{props.title}  | Alaturka Vakitler</title> ):""}
        {props.title ? (<meta property="og:title" content={`${props.title} | Alaturka Vakitler`}/> ):""}
        {props.title ? (<meta name="twitter:title" content={`${props.title}  | Alaturka Vakitler`}/> ):""}

        {props.description ? (<meta name="description" content={`${props.description}`} />):""}
        {props.description ? (<meta property="og:description" content={`${props.description}`}/>):""}
        {props.description ? ( <meta name="twitter:description" content={`${props.description}`}/>):""}
           
        {props.color ? (<meta name="theme-color" content={`${props.color}`} />):""}

        {props.image ? (<meta property="og:image" content={`${props.image}`}/>):""}
        {props.image ? (<meta name="twitter:image" content={`${props.image}`}/>):""}
        

        <link rel="canonical" href={`${window.location.href}`}/>
        <meta property="og:locale" content="tr_TR"/>
        <meta property="og:url" content={`${window.location.href}`}/>
		
        <meta name="twitter:card" content="summary_large_image"/> 
        <meta name="twitter:site" content={`${window.location.href}`}/>


		</Helmet>
	);
}

export default Seo;
