import {React,useEffect,useState} from 'react'
import ReactDOM from 'react-dom'
import {Link , NavLink} from 'react-router-dom'
import * as prismic from "@prismicio/client";
import Seo from "../Components/Seo"


const Blog = (props)=>{
    const client = prismic.createClient("alaturkavakitler");
    const [data, setData] = useState("icerikyok");

    useEffect( () => {
        async function fetchData() {
        var blogPosts = await client.getAllByType(props.page);
        setData(blogPosts)
        };
        fetchData()
      }, []);


        return (
            <div className={`blogList ${props.page}`}>
                        <Seo title={`${props.topTitle}`} />

               <h1 className='topTitle'>{props.topTitle}. </h1> 

                {data!="icerikyok" && data.map(item=>{
                    return(
                        <div className='item ' key={item.uid}>
                        <NavLink to={`/detay/${props.page}/${item.uid}`} className="nav-link" >
                        {item.data.image ?  <img src={item.data.image.url}></img>:""}
                            <span className='title'>{item.data.title[0].text}</span>
                            {item.data.author ? <span className='author'>{item.data.author[0].text}</span>:""}
                            {item.data.version ? <span className='version'>{item.data.version[0].text}</span>:""}


                        </NavLink>

                        </div>
                    )
                })}
                
            </div>
        )
}

export default Blog;
