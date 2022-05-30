import {React,useEffect,useState} from 'react'
import ReactDOM from 'react-dom'
import {    useParams  } from "react-router-dom";
import * as prismic from "@prismicio/client";
import { RichText } from 'prismic-reactjs';

const BlogDetails =(props)=>{
    let { page,id } = useParams();
    const client = prismic.createClient("alaturkavakitler");
    const [data, setData] = useState("icerikyok");

    useEffect( () => {
        async function fetchData() {
            
        var detay = await client.getByUID(page,id);
        
        setData(detay)
        };
        fetchData()
      }, [id]);


        return data!="icerikyok"?(
            <div className={`blogDetails ${page}`}>
                {data.data.image ?  <img src={data.data.image.url} alt="resim"></img>:""}
                            <span className='title'>{data.data.title[0].text}</span>
                            {data.data.author ? 
                            <span className='author block'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline bi bi-person-fill" viewBox="0 0 16 16">
  <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
</svg>
                            {data.data.author[0].text}</span>:""}
                            {data.data.version ? <span className='version'>{data.data.version[0].text}</span>:""}
                            {data.data.source ? <span className='source block'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
</svg>
                            {data.data.source[0].text}</span>:""}

                            {data.data.source ? <div className='detail'><RichText  render={data.data.text} /></div>:""}

            </div>
        ):""
}

export default BlogDetails;
