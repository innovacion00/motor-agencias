import { atom } from "nanostores";




export const  getdisponibility = async (paraiams) => {
    const layout =[
        {
            adults: 1,
            children_ages: [1,2]

        },
        {
            adults: 1,
            children_ages: [8,8,8]
        }
    ]
    const response = await  fetch("https://fakestoreapi.com/products",
        {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              //Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzM1MDgxNzEsImp0aSI6IjMzM2NlMGRhLWUyNGItNDY5ZC05MTBiLTM5OGNiNGMwZDk1MyIsInN1YiI6IjMzIn0.VdnApKNUr1sxUfe23QzYX5OHt-rccGpU51Ng5fWAo2s`,
            },
            // //body: JSON.stringify({
            //   //layout
            // }),
          }
    )
    
    if(response.ok) {
        const data = await response.json()
        console.log(data)
        return data
        }else("Error api")
    

}
