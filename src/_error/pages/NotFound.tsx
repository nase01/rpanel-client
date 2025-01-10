import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeftCircle } from "lucide-react";
import { useEffect } from "react";
import { updatePageTitle } from "@/lib/utils";
import { getJwt } from '@/lib/utils';

const Unauthorized = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const jwt = getJwt();

  const handleBackToDashboard = () => {
    navigate('/panel/dashboard');
  }

	useEffect(() => {
    updatePageTitle(location); 
  }, [location.pathname]);

  return (
		<div className="m-5 p-10 max-w-[650px] border border-danger shadow-lg rounded-lg bg-indigo-50 dark:bg-slate-900">
			<h2 className="mb-5 text-2xl font-extrabold text-danger">404 - Not Found</h2>
			It seems the page <b>"{location.pathname}"</b> you want to access  does not exist.
			<div className="mt-10">
				<Button size="sm" onClick={jwt ? handleBackToDashboard :  () => window.history.back()}>
					<ArrowLeftCircle className="mr-2" size={16} /> Back {jwt && "to Dashboard" }
				</Button>
			</div>
		</div>
  )
}

export default Unauthorized