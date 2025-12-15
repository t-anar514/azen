export function MapPlaceholder() {
  return (
    <div className="h-full w-full bg-muted/20 relative flex items-center justify-center border-l bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/139.6917,35.6895,10,0/600x800?access_token=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjdGxjZGoxMjYwY2FwMnRsY3g2Y2J2d250In0.X7-x5Qj5W6U1q1q1q1q1qQ')] bg-cover bg-center grayscale opacity-50">
       <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px]" />
       <div className="relative z-10 text-center p-6 bg-background/90 rounded-lg shadow-lg max-w-sm mx-4">
          <h3 className="font-semibold text-lg mb-2">Interactive Map</h3>
          <p className="text-muted-foreground text-sm">
             Map interaction is simulated in this demo. 
             <br/>
             Switch to &quot;Zen Mode&quot; to see experience pins.
          </p>
       </div>
    </div>
  )
}
