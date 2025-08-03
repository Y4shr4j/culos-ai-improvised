import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ApiSettings() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[260px]">
        <div className="p-2 pt-2">
          {/* Header */}
          <div className="h-[66px] border-b border-[#E5E8F1] mb-4">
            <div className="h-[62px] px-0 py-3 rounded-md shadow-[0px_2px_4px_0px_rgba(165,163,174,0.30)] flex items-center">
              <h1 className="text-[#23272E] font-['Public_Sans'] text-2xl font-bold leading-[22px]">
                API Settings
              </h1>
            </div>
          </div>

          {/* OpenAI Configuration Card */}
          <div className="w-[635px] p-3 px-4 bg-white rounded-[10px] border border-[#E5E8F1]">
            <div className="space-y-[9px]">
              {/* Card Title */}
              <h2 className="text-[#1A1A1A] font-['Public_Sans'] text-base font-semibold leading-[22px] mb-[9px]">
                OpenAI Configuration
              </h2>

              {/* Form Fields */}
              <div className="space-y-[9px]">
                {/* API Key Field */}
                <div className="space-y-[3px]">
                  <Label
                    htmlFor="apiKey"
                    className="text-[#1A1A1A] font-['Public_Sans'] text-xs font-normal leading-[22px]"
                  >
                    API Key
                  </Label>
                  <Input
                    id="apiKey"
                    type="password"
                    className="h-[31px] rounded border-[0.5px] border-[#E5E8F1] bg-white focus:border-[#E5E8F1] focus:ring-0"
                  />
                </div>

                {/* Default Model Field */}
                <div className="space-y-[3px]">
                  <Label
                    htmlFor="defaultModel"
                    className="text-[#1A1A1A] font-['Public_Sans'] text-xs font-normal leading-[22px]"
                  >
                    Default Model
                  </Label>
                  <Input
                    id="defaultModel"
                    type="text"
                    className="h-[31px] rounded border-[0.5px] border-[#E5E8F1] bg-white focus:border-[#E5E8F1] focus:ring-0"
                  />
                </div>

                {/* Max Requests per hour Field */}
                <div className="space-y-[3px]">
                  <Label
                    htmlFor="maxRequests"
                    className="text-[#1A1A1A] font-['Public_Sans'] text-xs font-normal leading-[22px]"
                  >
                    Max Requests per hour
                  </Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    className="h-[31px] rounded border-[0.5px] border-[#E5E8F1] bg-white focus:border-[#E5E8F1] focus:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
