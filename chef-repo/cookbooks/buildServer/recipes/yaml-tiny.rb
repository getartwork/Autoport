# Installs perl module "yaml-tiny" using source and build method.
# source to be built is hosted at autoport_repo in tar.gz archive format.

include_recipe 'buildServer::perl'

{
  'YAML-Tiny' => node['buildServer']['YAML-Tiny']['version']
}.each do |pkg, version|
  buildServer_perlPackage "#{pkg}-#{version}" do
    archive_name "#{pkg}-#{version}.tar.gz"
    archive_location node['buildServer']['download_location']
    extract_location node['buildServer']['perl']['extract_location']
    perl_prefix_dir node['buildServer']['perl']['prefix_dir']
    repo_location node['buildServer']['repo_url']
    action :install
  end
end

case node['platform']
  when 'ubuntu'
    log_record = "YAML-Tiny,#{node['buildServer']['YAML-Tiny']['version']},perl_modules,libyaml-tiny-perl"
  when 'redhat'
    log_record = "YAML-Tiny,#{node['buildServer']['YAML-Tiny']['version']},perl_modules,perl-yaml-tiny"
end

buildServer_log 'YAML-Tiny' do
  name         'YAML-Tiny'
  log_location node['log_location']
  log_record   log_record
  action       :add
end