import React from 'react'
import ReactDOM from 'react-dom'
import { NavLink} from 'react-router-dom'

const About =(props)=>{
        return(
            <div className='px-8'>
                <h1 className='topTitle'>{props.topTitle}. </h1> 
                <div className='aboutContent'>
                <svg xmlns="http://www.w3.org/2000/svg" id="hilal" width="34.836" height="30.879" viewBox="0 0 9.217 8.17" > <g fill="#f9f1f2"> <path d="M547.8 468.173c-28.93.027-56.165 7.537-81.81 20.927 1.325-.063-1.327.016-.001-.015 94.406.714 163.81 71.267 163.81 159.958-.013 88.443-71.234 159.29-159.676 159.63 20.156 13.02 50.204 19.625 77.41 19.703 99.331 3.57 181.909-81.016 181.908-180.348 0-99.331-81.3-181.622-181.64-179.855z" style={{ isolation: "auto", mixBlendMode: "normal", solidColor: "#000", solidOpacity: "1", }} strokeWidth="17.013" color="#000" enableBackground="accumulate" overflow="visible" transform="translate(-7.322 -10.614) scale(.02267)" ></path> <path fillRule="evenodd" strokeWidth="1" d="M375.923 618.152l17.604-52.392 31.759 45.691 55.926.442-33.966 44.889 16.54 52.654-52.59-18.246-45.123 32.074 1.181-55.876-44.333-32.885" transform="translate(-7.322 -10.614) scale(.02267)" ></path> </g> </svg> 
                <NavLink to="/amentu#hakkinda" className="nav-link">
                 <svg xmlns="http://www.w3.org/2000/svg" id="makili" width="158.858" height="102.283" viewBox="0 0 42.031 27.063" > <path fill="#f9f1f2" fillRule="evenodd" strokeWidth="0.259" d="M-93.01 550.771h3.114v10.596h-3.114v-7.603h2.996v-2.873h-2.996zm5.989 0h.119v10.479h5.986v.117h-6.105zm2.994 0h3.111v7.604h-3.111v-4.611h2.994v-2.873h-2.994zm5.986 0h.12v2.993h2.991v.12h-2.992v7.366h2.875v-4.492h.117v4.61h-3.111zm2.994 0h3.113v.12h-3.113zm5.986 0h.122v10.596h-3.114v-7.603h.12v7.486h2.872zm2.995 0h3.113v4.61h-.12v-4.49h-2.874v13.47h-.12zm5.986 0h.121v2.993h2.873v-2.993h.12v3.114h-2.993v2.873h2.992v4.61h-.119v-4.491h-2.873v4.49h-.121zm5.988 0h3.113v10.596h-3.113v-7.603h2.992v-2.873h-2.992zm-38.799 3.114v7.365h2.877v-7.365zm8.98 0v4.369h2.878v-4.37zm29.938 0v7.365h2.873v-7.365zm-9.1 4.369h.12v16.467h5.986v.117h-6.105zm-29.937 5.99h3.114v10.477h2.875v-10.477h.119v10.594h-3.112V564.36h-2.996zm8.983 0h3.111v10.594h-3.111v-7.602h2.994v-2.875h-2.994zm5.986 0h.12v2.992h2.874v-2.992h.117v3.111h-2.992v2.875h2.992v4.608h-.117v-4.49h-2.875v4.49h-.119zm5.988 0h.12v.117h-.12zm2.992 0h.122v2.992h2.992v.12h-2.992v7.365h2.873v-4.49h.119v4.607h-3.114zm8.98 0h3.114v4.608h-2.992v2.875h2.992v.119h-3.113zm5.99 0h3.112v.117h-2.994v10.477h-.119zm-5.868.117v4.373h2.873v-4.373zm-33.05 2.875h.118v10.479H-51.1v-10.479h.121v10.598h-42.03zm20.956 0h.12v7.602h-.12zm-11.857.12v7.365h2.877v-7.366z" transform="translate(93.01 -550.771)" ></path> </svg>               
                 </NavLink>

                <NavLink to="/amentu#hakkinda" className="nav-link">
                
                <span className='relative beyit'>bilmezdim neden bazı saatler alaturka vakitlere ayarlı</span>
                </NavLink>
                <div className='aboutDetails'>


<span className='creditsItem'>
<b> Katkıda Bulun • Sorun Bildir • Takip Et </b>
<span className='name'>Alaturka Vakitler</span>
<span className='links flex'>


<a href='https://github.com/saatleriayarlamaenstitusu/alaturkavakitler' title="github" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16"> <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/> </svg></a> 
<a href='mailto:info@alaturkavakitler.com' title="e posta" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-envelope-fill" viewBox="0 0 16 16">
  <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697ZM6.761 8.83l-6.57 4.027A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144l-6.57-4.027L8 9.586l-1.239-.757Zm3.436-.586L16 11.801V4.697l-5.803 3.546Z"/>
</svg></a> 

<a href='https://twitter.com/alaturkasaat' title="twitter" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter" viewBox="0 0 16 16">
  <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
</svg></a>


<a href='https://instagram.com/alaturkavakitler' title="instagram" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16"> <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/> </svg></a>

</span>

</span>


<span className='creditsItem'>
<b>Tasarım & Uygulama</b>
<span className='name'>Abdullah Öğük</span>
<span className='links flex'>
<a href='https://abdullahog.uk/' title="web" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16"> <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z"/> </svg></a>

<a href='https://github.com/abdullahoguk' title="github" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16"> <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/> </svg></a> 
<a href='https://www.instagram.com/abdullah.oguk' title="instagram" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16"> <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/> </svg></a>

</span>

</span>



                </div>
                
                <a href='https://github.com/saatleriayarlamaenstitusu/' title="Saatleri Ayarlama Enstitüsü "><img id="sae" src={`${process.env.PUBLIC_URL}/Icons/sae.svg`}></img> </a>
                </div>


            </div>
        )
}

export default About;