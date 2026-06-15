import { useState } from "react";
import { useCreateScan, ScanInputLanguage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListScansQueryKey, getGetDashboardStatsQueryKey, getGetRecentActivityQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Zap, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Scanner() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<ScanInputLanguage>("python");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: scanCode, isPending, data: result } = useCreateScan({
    mutation: {
      onSuccess: () => {
        toast({
          title: "Scan Complete",
          description: "Vulnerability analysis finished successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getListScansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRecentActivityQueryKey() });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Scan Failed",
          description: "An error occurred during analysis.",
        });
      }
    }
  });

  const handleScan = () => {
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Input",
        description: "Please provide code to analyze.",
      });
      return;
    }
    scanCode({ data: { codeInput: code, language } });
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold uppercase tracking-tight text-foreground">AI Code Scanner</h1>
        <p className="text-muted-foreground">Deep vulnerability analysis engine. Paste payload below.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Input Panel */}
        <Card className="glass-panel border-border/50 flex flex-col h-[70vh]">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground flex items-center gap-2">
              <CodeIcon className="w-4 h-4" /> Source Input
            </CardTitle>
            <Select value={language} onValueChange={(v) => setLanguage(v as ScanInputLanguage)}>
              <SelectTrigger className="w-[180px] bg-background border-border">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(ScanInputLanguage).map(lang => (
                  <SelectItem key={lang} value={lang} className="uppercase">{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col">
            <Textarea 
              className="flex-1 resize-none border-0 rounded-none bg-black/20 font-mono text-sm p-4 focus-visible:ring-0 focus-visible:ring-offset-0 text-green-400 placeholder:text-green-900/50"
              placeholder="// Paste suspect code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <div className="p-4 border-t border-border/50 bg-background/50">
              <Button 
                onClick={handleScan} 
                disabled={isPending || !code}
                className="w-full uppercase tracking-wider font-bold h-12"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Payload...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Initialize Scan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="glass-panel border-border/50 flex flex-col h-[70vh] overflow-hidden relative">
          {isPending && (
            <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
              <div className="text-primary font-mono animate-pulse">Running heuristic analysis...</div>
            </div>
          )}
          
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
            <CardTitle className="uppercase text-sm tracking-wider text-muted-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Scan Results
            </CardTitle>
            {result && (
              <Badge variant="outline" className={`
                uppercase px-3 py-1
                ${result.severity === 'critical' ? 'border-destructive text-destructive bg-destructive/10' : ''}
                ${result.severity === 'high' ? 'border-orange-500 text-orange-500 bg-orange-500/10' : ''}
                ${result.severity === 'medium' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : ''}
                ${result.severity === 'low' ? 'border-blue-400 text-blue-400 bg-blue-400/10' : ''}
                ${result.severity === 'none' ? 'border-primary text-primary bg-primary/10' : ''}
              `}>
                {result.severity} SEVERITY
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-6 overflow-auto">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <AlertTriangle className="w-16 h-16 mb-4" />
                <p className="uppercase tracking-widest text-sm">Awaiting payload</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Vulnerabilities */}
                <div>
                  <h3 className="uppercase text-xs font-bold text-muted-foreground mb-3 tracking-widest">Identified Vulnerabilities</h3>
                  {result.vulnerabilitiesFound.length > 0 ? (
                    <ul className="space-y-2">
                      {result.vulnerabilitiesFound.map((vuln, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm p-3 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{vuln}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex items-center gap-2 text-primary p-3 bg-primary/10 border border-primary/20 rounded text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>No vulnerabilities detected. Code appears secure.</span>
                    </div>
                  )}
                </div>

                {/* Remediation */}
                {result.remediation && (
                  <div>
                    <h3 className="uppercase text-xs font-bold text-muted-foreground mb-3 tracking-widest">Remediation Protocol</h3>
                    <div className="bg-black/40 border border-border/50 rounded-lg p-4">
                      <pre className="font-mono text-sm text-blue-400 whitespace-pre-wrap overflow-x-auto">
                        {result.remediation}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CodeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
