import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Info,
  AlertTriangle,
  Map,
  Bell,
  Users,
  Lock,
} from "lucide-react";
import Navbar from "@/components/Navbar";

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-8">
            <Shield className="h-10 w-10 text-primary mr-3" />
            <div>
              <h1 className="text-3xl font-bold">About CrimeWatch</h1>
              <p className="text-muted-foreground">
                Making communities safer through awareness
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>What we aim to achieve</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                CrimeWatch is a community-powered platform designed to increase
                awareness about safety concerns in your neighborhood. Our
                mission is to empower citizens with information and tools to
                track, report, and understand crime patterns in their areas.
              </p>
              <p>
                We believe that transparency and community involvement are key
                to creating safer neighborhoods. By providing real-time crime
                data and reporting capabilities, we aim to bridge the gap
                between law enforcement and the public.
              </p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Map className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Interactive Map</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  View crime incidents in your area through our interactive map
                  with color-coded markers for different crime types.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Incident Reporting</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Report incidents quickly and easily, with options for
                  anonymous reporting to protect your privacy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">
                    Alerts & Notifications
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Stay informed about incidents in your selected areas with
                  customizable alerts and notifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Info className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Crime Statistics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Access detailed crime statistics and trends to understand
                  safety patterns in your neighborhood.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Lock className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">How We Handle Your Data</h3>
                  <p className="text-muted-foreground">
                    CrimeWatch takes data privacy seriously. All personal
                    information is encrypted and protected. We only collect
                    what's necessary to provide our service.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <div>
                  <h3 className="font-medium">Anonymous Reporting</h3>
                  <p className="text-muted-foreground">
                    We offer anonymous reporting options to ensure community
                    members can contribute information without concerns about
                    personal identification.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-10 mb-4">
            <p className="text-muted-foreground">
              This is a demo application created for educational purposes.
            </p>
            <p className="text-muted-foreground">
              © {new Date().getFullYear()} CrimeWatch
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
