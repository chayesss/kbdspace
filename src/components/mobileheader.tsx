import { BiMenuAltLeft } from "react-icons/bi";
import { MyLogo } from "~/components/logo";

export const MobileHeader = () => {

    return (
        <div className="border-b-2 border-slate-700 lg:hidden">
          <div className="flex flex-row ml-4 mr-4 mt-4 mb-2 lg:hidden">
            <div className="pr-4 flex items-center">
              <BiMenuAltLeft size={42} />
            </div>
            <div className="flex-grow"></div>
            <div>
              <MyLogo width="200" height="40"/>
            </div>
          </div>
        </div>
    )

 }