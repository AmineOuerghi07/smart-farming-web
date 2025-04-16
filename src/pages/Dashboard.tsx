import { useState } from "react";
import { Activity, User, CheckSquare, Leaf, Calendar, Cloud, Clock, AlertTriangle, Check, Tractor, Sun, Wind } from "lucide-react";
import DashboardCard from "../components/DashboardCard";
import MetricRow from "../components/MetricRow";
import StatusMessage from "../components/StatusMessage";

import { PowerBIEmbed } from 'powerbi-client-react';

import { models, Report } from 'powerbi-client';




// Weather Card Component
const WeatherCard: React.FC = () => (
  <DashboardCard title="Weather Conditions" icon={Cloud}>
    <MetricRow icon={Sun} label="Temperature" value="75°F" iconColor="text-yellow-400" />
    <MetricRow icon={Cloud} label="Humidity" value="45%" iconColor="text-blue-400" />
    <MetricRow icon={Wind} label="Wind Speed" value="8 mph NW" iconColor="text-gray-400" />
    <StatusMessage message="Ideal conditions for harvesting" />
  </DashboardCard>
);

// Equipment Card Component
const EquipmentCard: React.FC = () => (
  <DashboardCard title="Equipment Status" icon={Tractor}>
    <MetricRow icon={Check} label="Active Tractors" value="3/5" iconColor="text-green-400" />
    <MetricRow icon={Clock} label="Hours Today" value="12.5 hrs" iconColor="text-yellow-400" />
    <MetricRow icon={AlertTriangle} label="Maintenance Due" value="2 vehicles" iconColor="text-red-400" />
    <StatusMessage message="Scheduled maintenance: Tractor #2 tomorrow" color="text-yellow-400" />
  </DashboardCard>
);

// Crop Card Component
const CropCard: React.FC = () => (
  <DashboardCard title="Crop Status" icon={Leaf}>
    <MetricRow icon={Leaf} label="Active Fields" value="12/15" iconColor="text-green-400" />
    <MetricRow icon={Calendar} label="Next Harvest" value="3 days" iconColor="text-blue-400" />
    <MetricRow icon={Cloud} label="Irrigation" value="Active (2/12)" iconColor="text-blue-400" />
    <StatusMessage message="Wheat fields ready for harvest next week" />
  </DashboardCard>
);

export default function DashboardPage() {
  const [metrics] = useState([
    { label: "Total Users", value: "1,200", icon: User },
    { label: "Active Sessions", value: "230", icon: Activity },
    { label: "System Health", value: "Operational", icon: CheckSquare },
  ]);

  const [report, setReport] = useState<Report>();


  return (
    <div className="w-full min-h-screen bg-gray-900 p-8 flex justify-center">
      <div className="w-full max-w-6xl">

        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="flex justify-center items-center w-full h-[90vh] bg-gray-900">
            <div className=" w-[95%] h-[95%]">
              <PowerBIEmbed
                embedConfig={{
                  type: 'report',   // Supported types: report, dashboard, tile, visual, qna, paginated report and create
                  id: '4be6380a-b3b9-4d2a-87b5-c8790649196a',
                  embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=4be6380a-b3b9-4d2a-87b5-c8790649196a&groupId=4fc768a7-e9be-44c9-8cda-27fad8373a4f&w=2&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1JLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJlbWJlZEZlYXR1cmVzIjp7InVzYWdlTWV0cmljc1ZOZXh0Ijp0cnVlfX0%3d',
                  accessToken: "H4sIAAAAAAAEAC2Tx66rWAJF_-VOaYl4ALf0BodgsjE5zMg5GDCpVP_et0s1X4OttbT_-nknVz8l-c9_f8ioyYXQakCbx5qoI5fd5MHV4uvEzcNR9S8mQeGqa8-FR-SIJgamnV6ipONBX5LGN16kGip8cz6M46ZrE1UYxfBtHgYh9V6ySGVaerTPgJ_KYHwKNzzGbZMx7UG-bdvQxNaOo1KYNLEk6fpmcBF_GJgHFIF91qfrYKVIVXxmfbISxY3w8jkjFapiNqoQPuwBb0ZFfaI2IdVFs5pSy16vKbvKlvqaljCFnVHo8n1vsvWeK_2lc42IkwNzeIrL4wwgAT5xeKZIWaVgTaKCy_se652EeCaybYkQaN9tvXlXArNwgbAn0VcTbJkEz8iMxrbut71DkV5dB3i2ZXAnfKknizUG0Wv0Wyb6CveSIOseBstNXC-_DuJ1KT9lOT7vQ_LO-enh-4eqFevEQNCEnxoX0d9BcT-RhNihIUkA2pNQC4tMwX1AOldOk3oXb23JJkQ_sx1l5YQJga1cwYqDIQkwvq_YJDCcet-lvgrBMGfYUh82kjaCiDtmyOaFYtmVGfPhXX82N8r3wvzMKkHH06lZEcZSxBNgW2B1ETsF9WBuYdd-KscDuqfu6wh0eZBpbG7ZF12PwUBTs6w815rVLq6K4450LdD1tUk5eecJMH4IT3izHlajdGuIKXZ1MSd0SaG8kQ8QiqJTBkkoI-s8IDVYWNl-IkvIzIptedn93A1qC9c3rEYeGC02DwrNBYcdAdVPezPwJeCYtN85hD3VbWBHhnFipuMwwJ2CLQXaHYI3_MI9nxMPog8OBRRi3ysy6uvEasuFvdh62bwvp5w2AvQGLyshhX_-_Pznh1-ueZu04vq9iUmG--MmNkMx_VtqmkNTU4S2oWRtI-uejvIth-8yuC_IieGGnTgTpPi1IKyfjDOoA8MYybt-wmBrzz03rJs5fCqFLzRMbymfU_hojrlsK6BIrZGvTeJhr2zTm0z31q2CbI-S7UXQzKu9CcbikMq332VaN3Q2aZHGOn2MfJMphRrlwj7-hr7eUjKxU77Aq9gFrbFPH5jgi0JHH2jIyyi1omIm6rzus0r0rUjgyFGrb-nHg0zcj07VMusx2tfDVYXPKB4L4QndGZHOkrp7wrti_-XErcQZbpufge9994eEFjeb-VioZAql43DVqKggrGGWkAN-Ak69XeqI0FilqUZ2qkH8V_M118Wi-L-WNUFMiF7daoLLRfwzPKEd49Y_lNNUY7J9l-IXK8sy6U3W8-SNSrr87mXSJehLy5a-Y97ueL7EKr0-2KCRX02OtFwn5_IZrI4vi9tVrUCECSfTirBnJK2m94uDY9YjwjphNVjAQ1woJi_zciQhKQasfXsbJVSTAk_nw8zvvXw9VTj5p2uD7AYezK2bitAk5SGLKyAVY4tLcRNL0Nj0ZkGSH2O3I_7oMtKhNgKrSO5lmQwTcYwZiT3DF41xjNTaVlG4-m0XfwzTSdjf2szA1mwlztMl9bm1hqpw4HDSW34xlmYKsaJxMdq5NE0bcCxQirWhUF-35fMO0JeBNYrt8zzI0QoDPlLGj4et9ylI07e9mi9_iPX8XWdIUlmtSv5f89__A1GrxC8aBgAA.eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLU5PUlRILUVVUk9QRS1JLVBSSU1BUlktcmVkaXJlY3QuYW5hbHlzaXMud2luZG93cy5uZXQiLCJleHAiOjE3NDQ3NzcwMzEsImFsbG93QWNjZXNzT3ZlclB1YmxpY0ludGVybmV0Ijp0cnVlfQ==",
                  tokenType: models.TokenType.Embed,
                  settings: {
                    panes: {
                      filters: {
                        expanded: false,
                        visible: false
                      },
                      pageNavigation: {
                        visible: false, // 🚫 Hides the page tabs at the bottom
                      },
                    },
                    background: models.BackgroundType.Transparent,
                  }
                }}

                eventHandlers={
                  new Map([
                    ['loaded', function () { console.log('Report loaded'); }],
                    ['rendered', function () { console.log('Report rendered'); }],
                    ['visualClicked', () => console.log('visual clicked')],
                    ['pageChanged', (event) => console.log(event)],
                  ])
                }


                cssClassName="w-full h-full"

                getEmbeddedComponent={(embeddedReport) => {
                  setReport(embeddedReport as Report);
                }}
              />
            </div>
          </div>
        </div>



        {/* Header Section */}
        <div className="mb-8 flex items-center gap-4">
          <div>
            <p className="text-green-500">Overview of system activity and performance</p>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {metrics.map((metric) => (
            <DashboardCard key={metric.label} title={metric.label} icon={metric.icon}>
              <MetricRow icon={metric.icon} label={metric.label} value={metric.value} />
            </DashboardCard>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <WeatherCard />
          <EquipmentCard />
          <CropCard />
        </div>


        {/* Recent Activity Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold text-green-400 mb-4">Recent Activity</h2>
          <StatusMessage message="User JohnDoe logged in." />
          <StatusMessage message="System update applied successfully." />
          <StatusMessage message="New user registered: JaneSmith." />
        </div>
      </div>
    </div>
  );
}
