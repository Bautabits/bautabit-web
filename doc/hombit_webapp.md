---
layout: documentation
title: Hombit Web Application
---

How does this work?
-------------------
When you access the root URL / on your Hombit, it responds with a simple HTML document that contains

{% highlight html %}
<html><body>
	<script src="{{site.root}}/js/lib/jquery.js"></script>
	<script>$.get('{{site.root}}/app.html', function(a){$('body').html(a)});</script>
</body></html>
{% endhighlight %}

The rest of the Javascript code for the web application is actually loaded from {{site.root}}.
The application runs in your browser and accesses your Hombit's REST endpoints from your browser,
although the actual Javascript code is loaded from our server. This way, the tiny MCU on your
Hombit board doesn't have to host the actual web application although you can use its URL to
access it. Neat, eh?
