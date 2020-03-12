/*
直播回放管理
2018-11-06
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio
} from 'antd';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

import FileDownloader from '@/components/FileDownloader';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import FaceTeachLiveCreate from './view';
import DropDownButton from '@/components/DropDownButton';

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind } from '@/utils';

import { queryLiveList, addLiveReplay, batchReleaseLives } from '@/actions/live';

class LivePlayBackManage extends React.Component {
  constructor() {
    super();
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        itemId: '',
        courseCategoryId:'',
        liveStatus: '',
        releaseStatus: '',
        replayFlag: ''
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {
    //载入需要的字典项: 
    this.loadBizDictionary(['dic_YesNo']);

    this.onSearch();
  }
  componentWillUnMount() {
  }

  columns = [
    {
      title: '直播名称',
      dataIndex: 'liveName',
      fixed: 'left',
      width: 200,
    },
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName'
    },
    {
      title: '教师',
      dataIndex: 'teacher',
    },
    {
      title: '预约开始时间',
      dataIndex: 'bookStartTime',
      render: (text, record, index) => {
        return timestampToTime(record.bookStartTime);
      }
    },
    {
      title: '预约截止时间',
      dataIndex: 'bookEndTime',
      render: (text, record, index) => {
        return timestampToTime(record.bookEndTime);
      }
    },
    {
      title: '开始时间',
      dataIndex: 'liveStartTime',
      render: (text, record, index) => {
        return timestampToTime(record.liveStartTime);
      }
    },
    {
      title: '结束时间',
      dataIndex: 'liveEndTime',
      render: (text, record, index) => {
        return timestampToTime(record.liveEndTime);
      }
    },
    {
      title: '预约人数',
      dataIndex: 'bookStudentCount'
    },
    {
      title: '剩余名额',
      dataIndex: 'remainBookStudentCount',
      render: (text, record, index) => {
        return record.remainBookStudentCount < 0 ? 0 : record.remainBookStudentCount;
      }
    },
    {
      title: '状态',
      dataIndex: 'liveStatus'
    },
    {
      title: '发布状态',
      dataIndex: 'status'
    },
    {
      title: '回放视频',
      dataIndex: 'replayMsg'
    },
    {
      title: '资料下载',
      width:120,
      dataIndex: 'studyFile',
      render: (text, record, index) => {
        return record.studyFile ? <FileDownloader
                    apiUrl={'/edu/file/getFile'}//api下载地址
                    method={'post'}//提交方式
                    options={{ filePath: record.studyFile }}
                    title={'下载'}
                  >
                  </FileDownloader> : '--'
      }
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', record); }}>回放管理</Button>
        </DropDownButton>
      ),
    }
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.queryLiveList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
            this.props.addLiveReplay(dataModel).payload.promise.then((response) => {
              let data = response.payload.data;
              if (data.state === 'error') {
                message.error(data.message, 5);
              }
              else {
                message.success('操作成功！')
                this.onSearch();
                //进入管理页
                this.onLookView("Manage", null);
              }
            })
          
          break;
          case 'Manage':
          default:
            //进入管理页
            this.onSearch();
            this.onLookView("Manage", null);
            break;
      }
    }
  }
  onPublish = (liveId) => {
    Modal.confirm({
      title: '确定要发布吗?',
      content: '请确认',
      onOk: () => {
        //默认第一个招生季
        this.props.batchReleaseLives({liveIds:liveId}).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message, 5);
          }
          else {
            message.success('发布成功！');
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }
  onBatchPublish = () => {
    Modal.confirm({
      title: '是否发布所选直播吗?',
      content: '请确认',
      onOk: () => {
        this.props.batchReleaseLives({liveIds:this.state.UserSelecteds.join(',')}).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('发布成功！');
            this.setState({ UserSelecteds: [] })
            this.onSearch();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

  onDeltet = (liveId) => {
        Modal.confirm({
            title: '是否删除所选直播?',
            content: '点击确认删除所选直播!否则点击取消！',
            onOk: () => {
                let params = { liveId: liveId, delFlag: 1 }
                this.props.addLiveReplay(params).payload.promise.then((response) => {
                    let data = response.payload.data;
                    if (data.state != 'success') {
                        this.setState({ loading: false })
                        message.error(data.message);
                    }
                    else {
                        message.success('删除成功！');
                        this.onSearch();
                    }
                })
            }
        })
    };

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
      case 'Edit':
        block_content = <FaceTeachLiveCreate
          viewCallback={this.onViewCallback}
          editMode={this.state.editMode} 
          {...this.state}
          />
        break; 
       
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'项目'}>
                        {getFieldDecorator('itemId', {
                          initialValue: this.state.pagingSearch.itemId
                        })(
                          <SelectItem
                            scope={'my'}
                            hideAll={false}
                            hidePleaseSelect={true}
                            onSelectChange={(value) => {
                              this.state.pagingSearch.itemId = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="状态" >
                        {getFieldDecorator('liveStatus', { initialValue: this.state.pagingSearch.liveStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="未开始" key='1'>未开始</Option>
                            <Option value="进行中" key='2'>进行中</Option>
                            <Option value="已结束" key='3'>已结束</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="科目"
                      >
                        {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                          <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="发布状态" >
                        {getFieldDecorator('releaseStatus', { initialValue: this.state.pagingSearch.releaseStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key='0'>待发布</Option>
                            <Option value="1" key='1'>已发布</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'直播名称'} >
                        {getFieldDecorator('liveName', { initialValue: this.state.pagingSearch.liveName })(
                          <Input placeholder="直播名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="视频回放" >
                        {getFieldDecorator('replayFlag', { initialValue: this.state.pagingSearch.replayFlag })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key='0'>暂无</Option>
                            <Option value="1" key='1'>已上传</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'教师名称'} >
                        {getFieldDecorator('teacher', { initialValue: this.state.pagingSearch.teacher })(
                          <Input placeholder="教师名称" />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                rowKey={record => record.liveId}//主键
                bordered
                scroll={{ x: 1500 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(LivePlayBackManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryLiveList: bindActionCreators(queryLiveList, dispatch),
    addLiveReplay: bindActionCreators(addLiveReplay, dispatch),
    batchReleaseLives: bindActionCreators(batchReleaseLives, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
