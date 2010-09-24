require "rack/rewrite"

use Rack::Rewrite do
  rewrite '/', '/index.html'
end

use Rack::Static, :urls => ["/"]

run lambda { [200, { :Content-type => "text/plain" }, "fail."] }
