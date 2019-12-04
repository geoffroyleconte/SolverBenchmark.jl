var documenterSearchIndex = {"docs": [

{
    "location": "#",
    "page": "Home",
    "title": "Home",
    "category": "page",
    "text": ""
},

{
    "location": "#Home-1",
    "page": "Home",
    "title": "SolverBenchmark.jl documentation",
    "category": "section",
    "text": "This package provides general tools for benchmarking solvers, focusing on a few guidelines:The output of a solver\'s run on a suite of problems is a DataFrame, where each row is a different problem.\nSince naming issues may arise (e.g., same problem with different number of variables), there must be an ID column;\nThe collection of two or more solver runs (DataFrames), is a Dict{Symbol,DataFrame}, where each key is a solver;This package is developed focusing on Krylov.jl and JSOSolvers.jl, but they should be general enough to be used in other places."
},

{
    "location": "tutorial/#",
    "page": "Tutorial",
    "title": "Tutorial",
    "category": "page",
    "text": ""
},

{
    "location": "tutorial/#Tutorial-1",
    "page": "Tutorial",
    "title": "Tutorial",
    "category": "section",
    "text": "In this tutorial we illustrate the main uses of SolverBenchmark.First, let\'s create fake data. It is imperative that the data for each solver be stored in DataFrames, and the collection of different solver must be stored in a dictionary of Symbol to DataFrame.In our examples we\'ll use the following data.using DataFrames, Printf, Random\n\nRandom.seed!(0)\n\nn = 10\nnames = [:alpha, :beta, :gamma]\nstats = Dict(name => DataFrame(:id => 1:n,\n         :name => [@sprintf(\"prob%03d\", i) for i = 1:n],\n         :status => map(x -> x < 0.75 ? :success : :failure, rand(n)),\n         :f => randn(n),\n         :t => 1e-3 .+ rand(n) * 1000,\n         :iter => rand(10:10:100, n),\n         :irrelevant => randn(n)) for name in names)The data consists of a (fake) run of three solvers alpha, beta and gamma. Each solver has a column id, which is necessary for joining the solvers (names can be repeated), and columns name, status, f, t and iter corresponding to problem results. There is also a column irrelevant with extra information that will not be used to produce our benchmarks.Here are the statistics of solver alpha:stats[:alpha]"
},

{
    "location": "tutorial/#Tables-1",
    "page": "Tutorial",
    "title": "Tables",
    "category": "section",
    "text": "The first thing we may want to do is produce a table for each solver. Notice that the solver result is already a DataFrame, so there are a few options available in other packages, as well as simply printing the DataFrame. Our concern here is two-fold: producing publication-ready LaTeX tables, and web-ready markdown tables.The simplest use is foo_table(io, dataframe). Here is printout to the stdout:using SolverBenchmark\n\nmarkdown_table(stdout, stats[:alpha])latex_table(stdout, stats[:alpha])Alternatively, you can print to a file.open(\"alpha.tex\", \"w\") do io\n  println(io, \"\\\\documentclass[varwidth=20cm,crop=true]{standalone}\")\n  println(io, \"\\\\usepackage{longtable}\")\n  println(io, \"\\\\begin{document}\")\n  latex_table(io, stats[:alpha])\n  println(io, \"\\\\end{document}\")\nendrun(`latexmk -quiet -pdf alpha.tex`)\nrun(`pdf2svg alpha.pdf alpha.svg`)(Image: )The main options for both table commands is cols, which defines which columns to use.markdown_table(stdout, stats[:alpha], cols=[:name, :f, :t])Notice that passing a column that does not exist will throw an error, but you can pass ignore_missing_cols=true to simply ignore that column.The fmt_override option overrides the formatting of a specific column. The  argument should be a dictionary of Symbol to functions, where the functions will be applied to each element of the column.The hdr_override simply changes the name of the column.fmt_override = Dict(:f => x->@sprintf(\"%+10.3e\", x),\n                    :t => x->@sprintf(\"%08.2f\", x))\nhdr_override = Dict(:name => \"Name\", :f => \"f(x)\", :t => \"Time\")\nmarkdown_table(stdout, stats[:alpha], cols=[:name, :f, :t], fmt_override=fmt_override, hdr_override=hdr_override)This allows for elaborate things, such asfunction time_fmt(x)\n  xi = floor(Int, x)\n  minutes = div(xi, 60)\n  seconds = xi % 60\n  micros  = round(Int, 1e6 * (x - xi))\n  @sprintf(\"%2dm %02ds %06dμs\", minutes, seconds, micros)\nend\nfmt_override = Dict(:f => x->@sprintf(\"%+10.3e\", x), :t => time_fmt)\nhdr_override = Dict(:name => \"Name\", :f => \"f(x)\", :t => \"Time\")\nmarkdown_table(stdout, stats[:alpha], cols=[:name, :f, :t], fmt_override=fmt_override, hdr_override=hdr_override)Notice that for latex_table, the output must be understood by the LaTeX compiler. To that end, we have a few functions that convert a specific element into a LaTeX-safe string: safe_latex_AbstractFloat, safe_latex_AbstractString, safe_latex_Symbol and safe_latex_Signed.function time_fmt(x)\n  xi = floor(Int, x)\n  minutes = div(xi, 60)\n  seconds = xi % 60\n  micros  = round(Int, 1e6 * (x - xi))\n  @sprintf(\"\\\\(%2d\\\\)m \\\\(%02d\\\\)s \\\\(%06d\\\\mu s\\\\)\", minutes, seconds, micros)\nend\nfmt_override = Dict(:f => x->@sprintf(\"%+10.3e\", x) |> safe_latex_AbstractFloat,\n                    :t => time_fmt)\nhdr_override = Dict(:name => \"Name\", :f => \"\\\\(f(x)\\\\)\", :t => \"Time\")\nopen(\"alpha2.tex\", \"w\") do io\n  println(io, \"\\\\documentclass[varwidth=20cm,crop=true]{standalone}\")\n  println(io, \"\\\\usepackage{longtable}\")\n  println(io, \"\\\\begin{document}\")\n  latex_table(io, stats[:alpha], cols=[:name, :f, :t], fmt_override=fmt_override, hdr_override=hdr_override)\n  println(io, \"\\\\end{document}\")\nendrun(`latexmk -quiet -pdf alpha2.tex`)\nrun(`pdf2svg alpha2.pdf alpha2.svg`)(Image: )"
},

{
    "location": "tutorial/#Joining-tables-1",
    "page": "Tutorial",
    "title": "Joining tables",
    "category": "section",
    "text": "In some occasions, instead of/in addition to showing individual results, we show a table with the result of multiple solvers.df = join(stats, [:f, :t])\nmarkdown_table(stdout, df)The column :id is used as guide on where to join. In addition, we may have repeated columns between the solvers. We convery that information with argument invariant_cols.df = join(stats, [:f, :t], invariant_cols=[:name])\nmarkdown_table(stdout, df)join also accepts hdr_override for changing the column name before appending _solver.hdr_override = Dict(:name => \"Name\", :f => \"f(x)\", :t => \"Time\")\ndf = join(stats, [:f, :t], invariant_cols=[:name], hdr_override=hdr_override)\nmarkdown_table(stdout, df)hdr_override = Dict(:name => \"Name\", :f => \"\\\\(f(x)\\\\)\", :t => \"Time\")\ndf = join(stats, [:f, :t], invariant_cols=[:name], hdr_override=hdr_override)\nopen(\"alpha3.tex\", \"w\") do io\n  println(io, \"\\\\documentclass[varwidth=20cm,crop=true]{standalone}\")\n  println(io, \"\\\\usepackage{longtable}\")\n  println(io, \"\\\\begin{document}\")\n  latex_table(io, df)\n  println(io, \"\\\\end{document}\")\nendrun(`latexmk -quiet -pdf alpha3.tex`)\nrun(`pdf2svg alpha3.pdf alpha3.svg`)(Image: )"
},

{
    "location": "tutorial/#Profiles-1",
    "page": "Tutorial",
    "title": "Profiles",
    "category": "section",
    "text": "Performance profiles are a comparison tool developed by Dolan and Moré, 2002 that takes into account the relative performance of a solver and whether it has achieved convergence for each problem. SolverBenchmark.jl uses BenchmarkProfiles.jl for generating performance profiles from the dictionary of DataFrames.The basic usage is performance_profile(stats, cost), where cost is a function applied to a DataFrame and returning a vector.# Running on setup to avoid warnings\nusing Plots\npyplot()\n\np = performance_profile(stats, df -> df.t)\nPlots.svg(p, \"profile1\")using Plots\npyplot()\n\np = performance_profile(stats, df -> df.t)\nPlots.svg(p, \"profile1\")(Image: )Notice that we used df -> df.t which corresponds to the column :t of the DataFrames. This does not take into account that the solvers have failed for a few problems (according to column :status). The next profile takes that into account.cost(df) = (df.status .!= :success) * Inf + df.t\np = performance_profile(stats, cost)\nPlots.svg(p, \"profile2\")cost(df) = (df.status .!= :success) * Inf + df.t\np = performance_profile(stats, cost)\nPlots.svg(p, \"profile2\")(Image: )"
},

{
    "location": "tutorial/#Profile-wall-1",
    "page": "Tutorial",
    "title": "Profile wall",
    "category": "section",
    "text": "Another profile function is profile_solvers, which creates a wall of performance profiles, accepting multiple costs and doing 1 vs 1 comparisons in addition to the traditional performance profile.solved(df) = (df.status .== :success)\ncosts = [df -> .!solved(df) * Inf + df.t, df -> .!solved(df) * Inf + df.iter]\ncostnames = [\"Time\", \"Iterations\"]\np = profile_solvers(stats, costs, costnames)\nPlots.svg(p, \"profile3\")solved(df) = (df.status .== :success)\ncosts = [df -> .!solved(df) * Inf + df.t, df -> .!solved(df) * Inf + df.iter]\ncostnames = [\"Time\", \"Iterations\"]\np = profile_solvers(stats, costs, costnames)\nPlots.svg(p, \"profile3\")(Image: )"
},

{
    "location": "api/#",
    "page": "API",
    "title": "API",
    "category": "page",
    "text": ""
},

{
    "location": "api/#API-1",
    "page": "API",
    "title": "API",
    "category": "section",
    "text": "Pages = [\"api.md\"]"
},

{
    "location": "api/#SolverBenchmark.format_table",
    "page": "API",
    "title": "SolverBenchmark.format_table",
    "category": "function",
    "text": "format_table(df, formatter, kwargs...)\n\nFormat the data frame into a table using formatter. Used by other table functions.\n\nInputs:\n\ndf::DataFrame: Dataframe of a solver. Each row is a problem.\nformatter::Function: A function that formats its input according to its type. See LTXformat or MDformat for examples.\n\nKeyword arguments:\n\ncols::Array{Symbol}: Which columns of the df. Defaults to using all columns;\nignore_missing_cols::Bool: If true, filters out the columns in cols that don\'t exist in the data frame. Useful when creating tables for solvers in a loop where one solver has a column the other doesn\'t. If false, throws BoundsError in that situation.\nfmt_override::Dict{Symbol,Function}: Overrides format for a specific column, such as\nfmt_override=Dict(:name => x->@sprintf(\"%-10s\", x))\nhdr_override::Dict{Symbol,String}: Overrides header names, such as hdr_override=Dict(:name => \"Name\").\n\nOutputs:\n\nheader::Array{String,1}: header vector.\ntable::Array{String,2}: formatted table.\n\n\n\n\n\n"
},

{
    "location": "api/#Base.join",
    "page": "API",
    "title": "Base.join",
    "category": "function",
    "text": "df = join(stats, cols; kwargs...)\n\nJoin a dictionary of DataFrames given by stats. Column :id is required in all DataFrames. The resulting DataFrame will have column id and all columns cols for each solver.\n\nInputs:\n\nstats::Dict{Symbol,DataFrame}: Dictionary of DataFrames per solver. Each key is a different solver;\ncols::Array{Symbol}: Which columns of the DataFrames.\n\nKeyword arguments:\n\ninvariant_cols::Array{Symbol,1}: Invariant columns to be added, i.e., columns that don\'t change depending on the solver (such as name of problem, number of variables, etc.);\nhdr_override::Dict{Symbol,String}: Override header names.\n\nOutput:\n\ndf::DataFrame: Resulting dataframe.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.latex_table",
    "page": "API",
    "title": "SolverBenchmark.latex_table",
    "category": "function",
    "text": "latex_table(io, df, kwargs...)\n\nCreate a latex longtable of a DataFrame using LaTeXTabulars, and format the output for a publication-ready table.\n\nInputs:\n\nio::IO: where to send the table, e.g.:\nopen(\"file.tex\", \"w\") do io\n  latex_table(io, df)\nend\nIf left out, io defaults to stdout.\ndf::DataFrame: Dataframe of a solver. Each row is a problem.\n\nKeyword arguments:\n\ncols::Array{Symbol}: Which columns of the df. Defaults to using all columns;\nignore_missing_cols::Bool: If true, filters out the columns in cols that don\'t exist in the data frame. Useful when creating tables for solvers in a loop where one solver has a column the other doesn\'t. If false, throws BoundsError in that situation.\nfmt_override::Dict{Symbol,Function}: Overrides format for a specific column, such as\nfmt_override=Dict(:name => x->@sprintf(\"\\textbf{%s}\", x) |> safe_latex_AbstractString)`\nhdr_override::Dict{Symbol,String}: Overrides header names, such as hdr_override=Dict(:name => \"Name\"), where LaTeX escaping should be used if necessary.\n\nWe recommend using the safe_latex_foo functions when overriding formats, unless you\'re sure you don\'t need them.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.markdown_table",
    "page": "API",
    "title": "SolverBenchmark.markdown_table",
    "category": "function",
    "text": "markdown_table(io, df, kwargs...)\n\nCreate a markdown table from a DataFrame using PrettyTables and format the output.\n\nInputs:\n\nio::IO: where to send the table, e.g.:\nopen(\"file.md\", \"w\") do io\n  markdown_table(io, df)\nend\nIf left out, io defaults to stdout.\ndf::DataFrame: Dataframe of a solver. Each row is a problem.\n\nKeyword arguments:\n\ncols::Array{Symbol}: Which columns of the df. Defaults to using all columns;\nignore_missing_cols::Bool: If true, filters out the columns in cols that don\'t exist in the data frame. Useful when creating tables for solvers in a loop where one solver has a column the other doesn\'t. If false, throws BoundsError in that situation.\nfmt_override::Dict{Symbol,Function}: Overrides format for a specific column, such as\nfmt_override=Dict(:name => x->@sprintf(\"%-10s\", x))\nhdr_override::Dict{Symbol,String}: Overrides header names, such as hdr_override=Dict(:name => \"Name\").\n\n\n\n\n\n"
},

{
    "location": "api/#Tables-1",
    "page": "API",
    "title": "Tables",
    "category": "section",
    "text": "format_table\njoin\nlatex_table\nmarkdown_table"
},

{
    "location": "api/#SolverBenchmark.bmark_results_to_dataframes",
    "page": "API",
    "title": "SolverBenchmark.bmark_results_to_dataframes",
    "category": "function",
    "text": "stats = bmark_results_to_dataframes(results)\n\nConvert PkgBenchmark results to a dictionary of DataFrames.\n\nInputs:\n\nresults::BenchmarkResults: the result of PkgBenchmark.benchmarkpkg()\n\nOutput:\n\nstats::Dict{Symbol,DataFrame}: a dictionary of DataFrames containing the   benchmark results per solver.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.judgement_results_to_dataframes",
    "page": "API",
    "title": "SolverBenchmark.judgement_results_to_dataframes",
    "category": "function",
    "text": "stats = judgement_results_to_dataframes(judgement)\n\nConvert BenchmarkJudgement results to a dictionary of DataFrames.\n\nInputs:\n\njudgement::BenchmarkJudgement: the result of, e.g.,\ncommit = benchmarkpkg(mypkg)  # benchmark a commit or pull request\nmaster = benchmarkpkg(mypkg, \"master\")  # baseline benchmark\njudgement = judge(commit, master)\n\nOutput:\n\nstats::Dict{Symbol,DataFrame}: a dictionary of DataFrames containing the   target and baseline benchmark results.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.to_gist",
    "page": "API",
    "title": "SolverBenchmark.to_gist",
    "category": "function",
    "text": "posted_gist = to_gist(results, p)\n\nCreate and post a gist with the benchmark results and performance profiles.\n\nInputs:\n\nresults::BenchmarkResults: the result of PkgBenchmark.benchmarkpkg()\np:: the result of profile_solvers().\n\nOutput:\n\nthe return value of GitHub.jl\'s create_gist().\n\n\n\n\n\nposted_gist = to_gist(results)\n\nCreate and post a gist with the benchmark results and performance profiles.\n\nInputs:\n\nresults::BenchmarkResults: the result of PkgBenchmark.benchmarkpkg()\n\nOutput:\n\nthe return value of GitHub.jl\'s create_gist().\n\n\n\n\n\n"
},

{
    "location": "api/#PkgBenchmark-1",
    "page": "API",
    "title": "PkgBenchmark",
    "category": "section",
    "text": "bmark_results_to_dataframes\njudgement_results_to_dataframes\nto_gist"
},

{
    "location": "api/#BenchmarkProfiles.performance_profile",
    "page": "API",
    "title": "BenchmarkProfiles.performance_profile",
    "category": "function",
    "text": "performance_profile(stats, cost)\n\nProduce a performance profile comparing solvers in stats using the cost function.\n\nInputs:\n\nstats::Dict{Symbol,DataFrame}: pairs of :solver => df;\ncost::Function: cost function applyed to each df. Should return a vector with the cost of solving the problem at each row;\n0 cost is not allowed;\nIf the solver did not solve the problem, return Inf or a negative number.\n\nExamples of cost functions:\n\ncost(df) = df.elapsed_time: Simple elapsed_time cost. Assumes the solver solved the problem.\ncost(df) = (df.status .!= :first_order) * Inf + df.elapsed_time: Takes into consideration the status of the solver.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.profile_solvers",
    "page": "API",
    "title": "SolverBenchmark.profile_solvers",
    "category": "function",
    "text": "p = profile_solvers(stats, costs, costnames)\n\nProduce performance profiles comparing solvers based on the data in stats.\n\nInputs:\n\nstats::Dict{Symbol,DataFrame}: a dictionary of DataFrames containing the   benchmark results per solver (e.g., produced by bmark_results_to_dataframes())\ncosts::Vector{Function}: a vector of functions specifying the measures to use in the profiles\ncostnames::Vector{String}: names to be used as titles of the profiles.\n\nKeyword inputs:\n\nwidth::Int: Width of each individual plot (Default: 400)\nheight::Int: Height of each individual plot (Default: 400)\n\nOutput: A Plots.jl plot representing a set of performance profiles comparing the solvers. The set contains performance profiles comparing all the solvers together on the measures given in costs. If there are more than two solvers, additional profiles are produced comparing the solvers two by two on each cost measure.\n\n\n\n\n\np = profile_solvers(results)\n\nProduce performance profiles based on PkgBenchmark.benchmarkpkg results.\n\nInputs:\n\nresults::BenchmarkResults: the result of PkgBenchmark.benchmarkpkg().\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.profile_package",
    "page": "API",
    "title": "SolverBenchmark.profile_package",
    "category": "function",
    "text": "p = profile_package(judgement)\n\nProduce performance profiles based on PkgBenchmark.BenchmarkJudgement results.\n\nInputs:\n\njudgement::BenchmarkJudgement: the result of, e.g.,\ncommit = benchmarkpkg(mypkg)  # benchmark a commit or pull request\nmaster = benchmarkpkg(mypkg, \"master\")  # baseline benchmark\njudgement = judge(commit, master)\n\n\n\n\n\n"
},

{
    "location": "api/#Profiles-1",
    "page": "API",
    "title": "Profiles",
    "category": "section",
    "text": "performance_profile\nprofile_solvers\nprofile_package"
},

{
    "location": "api/#SolverBenchmark.LTXformat",
    "page": "API",
    "title": "SolverBenchmark.LTXformat",
    "category": "function",
    "text": "LTXformat(x)\n\nFormat x according to its type. For types Signed, AbstractFloat, AbstractString and Symbol, use a predefined formatting string passed to @sprintf and then the corresponding safe_latex_<type> function.\n\nFor type Missing, return \"NA\".\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.MDformat",
    "page": "API",
    "title": "SolverBenchmark.MDformat",
    "category": "function",
    "text": "MDformat(x)\n\nFormat x according to its type. For types Signed, AbstractFloat, AbstractString and Symbol, use a predefined formatting string passed to @sprintf.\n\nFor type Missing, return \"NA\".\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.safe_latex_AbstractFloat",
    "page": "API",
    "title": "SolverBenchmark.safe_latex_AbstractFloat",
    "category": "function",
    "text": "safe_latex_AbstractFloat(s)\n\nFor floats. Bypasses Inf and NaN. Enclose both the mantissa and the exponent in \\( and \\).\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.safe_latex_AbstractString",
    "page": "API",
    "title": "SolverBenchmark.safe_latex_AbstractString",
    "category": "function",
    "text": "safe_latex_AbstractString(s)\n\nFor strings. Replaces _ with \\_.\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.safe_latex_Signed",
    "page": "API",
    "title": "SolverBenchmark.safe_latex_Signed",
    "category": "function",
    "text": "safe_latex_Signed(s)\n\nFor signed integers. Encloses s in \\( and \\).\n\n\n\n\n\n"
},

{
    "location": "api/#SolverBenchmark.safe_latex_Symbol",
    "page": "API",
    "title": "SolverBenchmark.safe_latex_Symbol",
    "category": "function",
    "text": "safe_latex_Symbol(s)\n\nFor symbols. Same as strings.\n\n\n\n\n\n"
},

{
    "location": "api/#Formatting-1",
    "page": "API",
    "title": "Formatting",
    "category": "section",
    "text": "LTXformat\nMDformat\nsafe_latex_AbstractFloat\nsafe_latex_AbstractString\nsafe_latex_Signed\nsafe_latex_Symbol"
},

{
    "location": "reference/#",
    "page": "Reference",
    "title": "Reference",
    "category": "page",
    "text": ""
},

{
    "location": "reference/#Reference-1",
    "page": "Reference",
    "title": "Reference",
    "category": "section",
    "text": ""
},

]}