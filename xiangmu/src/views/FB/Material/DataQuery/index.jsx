 
//标准组件环境
import React from 'react'; 
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import { message, Form, Row, Col,DatePicker, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item; 

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { timestampToTime } from '@/utils';

//业务接口方法引入 
import { DetailsOfInformation,DetailsOfChoiceSure } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';  
import Info from './info';  
//学生详情  
import FileDownloader from '@/components/FileDownloader';
import EditableTeacher from '@/components/EditableTeacher';



class StudentStudyInfo  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      teacherInfo:[], 
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        materialType:'', 
        materialStatus: '',
        itemId: '',
        courseCategoryId:'',
        materialName: '',
        isPack:'',  
        isOutside:'', 
        teacher: '',
        materialId: '', 
        auditStatus:''
      },
      data: [],
      totalRecord: 0, 
      loading: false, 

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'category_state','student_change_status','dic_YesNo','material_type']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    this.onSearch();
  }
  componentWillUnMount() {
  }  
  //table 输出列定义
  columns = [
    {
      title: "资料名称",
      width: 180,
      fixed: 'left',
      dataIndex: 'materialName'
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
      title: '资料类型',
      dataIndex: 'materialType',
    },
    {
      title: '打包资料',
      dataIndex: 'isPack',
    },
    {
      title: '外购',
      dataIndex: 'isOutside', 
    },
    {
      title: '教师',
      dataIndex: 'teacher', 
    }, 
    {
      title: '创建人',
      dataIndex: 'founder', 
    }, 
    {
      title: '最新修改人',
      dataIndex: 'modifier', 
    }, 
    {
      title: '最新修改日期',
      dataIndex: 'modifyDate', 
      render:(text,record)=>{
        return timestampToTime(record.modifyDate).slice(0,10)
      }
    }, 
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        //编辑   适用商品 互斥设置(2)
        return  <Button onClick={() => { this.onLookView('ViewInfo', record); }}>查看</Button> 
      },
    }]; 

  //检索数据
  fetch = (params = {}) => {
   
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;   
    let onOff = false;
    let name = '';
    if(Array.isArray(condition.teacherId)&&condition.teacherId[0]){
      condition.teacher =  condition.teacherId[0].id;
      name = condition.teacherId[0].name;
      onOff = true;
      delete condition.teacherId;
    }else{
      condition.teacher = ''
    }
    this.props.DetailsOfInformation(condition).payload.promise.then((response) => {
      let data = response.payload.data; 
      if (data.state === 'success') {
        
        var teacherInfo = []; 
        if(onOff){
          teacherInfo.push({
              id: condition.teacher,
              name: name
          }) 
        } 
        this.setState({ 
          pagingSearch: condition,
          data: data.data,
          totalRecord: data.totalRecord,
          loading: false,
          teacherInfo
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
    }
    else {
      switch (this.state.editMode) {
        case "Student":
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Create":
        case "Edit": //提交
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Import":
          this.onSearch();
          this.onLookView("Manage", null);
          //提交
          break;

      }
    }
  }
 

  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form; 
    let block_content = <div></div>
    switch (this.state.editMode) {   
      case "ViewInfo":
        block_content = <Info viewCallback={this.onViewCallback} {...this.state} />
        break; 
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = []; 
        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '资料类型'
                    >
                    {
                        getFieldDecorator('materialType',{ initialValue:this.state.pagingSearch.materialType})(
                        <Select>
                            <Option value=''>全部</Option>
                            {
                              this.state.material_type.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                              })
                            }
                        </Select>
                        )
                    }
                    </FormItem>
                </Col> 
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"状态"}
                  >
                    {getFieldDecorator('auditStatus', { initialValue: this.state.pagingSearch.auditStatus })(
                      <Select >
                          <Option value="">全部</Option>
                          <Option value="1">启用</Option> 
                          <Option value="0">停用</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col> 
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(

                      <SelectItem
                          scope={'my'}
                          hideAll={false} 
                          onSelectChange={(value) => {
                            this.state.pagingSearch.itemId = value;
                            // this.state.pagingSearch.courseCategoryId = '';
                            this.setState({ pagingSearch: this.state.pagingSearch });
                            setTimeout(() => {
                                {/* 重新重置科目项 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                                this.onSearch();
                            }, 500);
                          }}
                        />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '科目'
                    >
                    {
                        getFieldDecorator('courseCategoryId',{ initialValue:this.state.pagingSearch.courseCategoryId})(
                        <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                        )
                    }
                    </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label={"资料名称"}
                  >
                    {getFieldDecorator('materialName', { initialValue: this.state.pagingSearch.materialName })(
                      <Input placeholder='资料名称'/>
                    )}
                  </FormItem>
                </Col>     
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '是否外购'
                    >
                    {
                        getFieldDecorator('isOutside',{ initialValue:this.state.pagingSearch.isOutside})(
                        <Select>
                            <Option value = ''>全部</Option>
                            <Option value = '1'>是</Option>
                            <Option value = '0'>否</Option> 
                        </Select>
                        )
                    }
                    </FormItem>
                </Col> 
                <Col span={12}>
                    <FormItem
                    {...searchFormItemLayout}
                    label = '是否打包资料'
                    >
                    {
                        getFieldDecorator('isPack',{ initialValue:this.state.pagingSearch.isPack})(
                        <Select>
                             <Option value="">全部</Option>
                            {
                            this.state.dic_YesNo.map(item=>{
                                return <Option value={item.value}>{item.title}</Option>
                            })
                            }
                        </Select>
                        )
                    }
                    </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'教师'} >
                    {getFieldDecorator('teacherId', { 
                        initialValue: 
                        (!this.state.teacherInfo.length ? [] : [{
                            id: this.state.teacherInfo[0].id,
                            name: this.state.teacherInfo[0].name
                          }]) 
                          })(
                      <EditableTeacher  maxTags={1} />
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered 
                   scroll={{ x: 1300 }}
            />
            <div className="space-default"></div>
            <div className="search-paging">
              <Row justify="end" align="middle" type="flex">  
                <Col span={2}>
                    <FileDownloader
                        apiUrl={'/edu/material/exportMaterials'}//api下载地址
                        method={'post'}//提交方式
                        options={this.state.pagingSearch}//提交参数
                        title={'导出'}
                      >
                      </FileDownloader> 
                </Col>
                <Col span={22} className='search-paging-control'>
                  <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      
                      pageSizeOptions = {['10','20','30','50','100','200']}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                </Col>
              </Row>
            </div>
          </div>
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(StudentStudyInfo);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //列表
    DetailsOfInformation: bindActionCreators(DetailsOfInformation, dispatch), 
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
