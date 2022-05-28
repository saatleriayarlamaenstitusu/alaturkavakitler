import {React,useEffect,useState} from 'react'
import ReactDOM from 'react-dom'
import {    useParams  } from "react-router-dom";
import * as prismic from "@prismicio/client";

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
      }, []);

      console.log(data)

        return(
            <div className=''>
                BlogDetails {page +" " +id}
            </div>
        )
}

export default BlogDetails;
