import { useLocation } from "react-router-dom"


export default function Breadcrumbs() {

  const location = useLocation()
  const crumbs = location.pathname.split('/').filter(crumb => crumb!=='')

  return (
    <>
        {crumbs.map((crumb,index)=>
            (<div key={index}>
                <p className="text-red-600">
                    {crumb}
                </p>
            </div>)
        )}
    </>
  )
}
