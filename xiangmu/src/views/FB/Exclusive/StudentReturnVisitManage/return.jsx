
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Table, Input, Button, Select, Icon, DatePicker, InputNumber, Radio, message } from 'antd';
import ContentBox from '@/components/ContentBox';
const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};
const searchFormItemLayout12 = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
}

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { returnVisitSelectReturnSivit, returnVisitStudentDel } from '@/actions/stuService';

class ReturnView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel || {courseCategoryId:'',isPublic:0},//数据模型
            data: [],
            returnSivitList: []
        };
    }

    componentWillMount() {

        this.getReturnSivit();

    }

    getReturnSivit = () => {
        if(this.state.dataModel.returnVisitTaskId){

            let condition = {
                studentId: this.state.dataModel.studentId,
                returnVisitTaskId: this.state.dataModel.returnVisitTaskId,
            }
            this.setState({ loading: true });
            this.props.returnVisitSelectReturnSivit(condition).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.result === false) {
                    this.setState({ loading: false })
                    message.error(data.message);
                }
                else {
            
                    this.setState({ returnSivitList: data.data, loading: false });
            
                }
            })
        }
    }

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {
        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                that.setState({ loading: true });
                setTimeout(() => {
                    that.setState({ loading: false });
                }, 3000);//合并保存数据

                if(this.state.dataModel.returnVisitTaskId) values.returnVisitTaskId = this.state.dataModel.returnVisitTaskId;
                if(this.state.dataModel.studentId) values.studentId = this.state.dataModel.studentId;
                values.returnVisitDate = formatMoment(values.returnVisitDate,dateFormat);

                that.props.viewCallback(values);

            }
        });
    }


    //删除
  onReturnVisitDetal = (record) => {
    Modal.confirm({
      title: '您确定删除此条回访信息吗？',
      content: '请确认',
      onOk: () => {
        var params = {};
        params.returnVisitStudentId = record.returnVisitStudentId;//回访记录ID

        this.props.returnVisitStudentDel(params).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.result === false) {
            message.error(data.message);
          }
          else {
            message.success('删除成功！');
            this.getReturnSivit();
          }
        })
      },
      onCancel: () => {
        console.log('Cancel');
      },
    });
  }

    //标题
    getTitle() {
        //加载最新的数据
        return `录入回访信息`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode == 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>保存</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form>
                        <Row gutter={24}>
                            
                            <Col span={12} >
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="项目"
                                >
                                { this.state.dataModel.itemName }
                                </FormItem>
                            </Col>
                            <Col span={12} >
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="任务名称"
                                >
                                { this.state.dataModel.returnVisitTaskName }
                                </FormItem>
                            </Col>
                            <Col span={24} >
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="回访要点"
                                >
                                    { this.state.dataModel.remark }
                                </FormItem>
                            </Col>
                                
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                                {this.state.dataModel.realName}
                              </FormItem>
                            </Col>
                            
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'教学点'} >
                                {this.state.dataModel.teachCenter}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'手机号'} >
                                {this.state.dataModel.mobile}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'微信'} >
                                {this.state.dataModel.weixin}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'QQ'} >
                                {this.state.dataModel.qq}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'入学年份'} >
                                {this.state.dataModel.year}
                              </FormItem>
                            </Col>
                            <Col span={12}>
                              <FormItem {...searchFormItemLayout} label={'就读高校'} >
                                {this.state.dataModel.university}
                              </FormItem>
                            </Col>

                            <Col span={24}>
                                <FormItem {...searchFormItemLayout12} label="录入回访信息" style={{marginLeft:"-54px"}}>
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label={'回访日期'} >
                                        {getFieldDecorator('returnVisitDate', {
                                            initialValue: dataBind(timestampToTime(this.state.dataModel.returnVisitDate, true), true),
                                        })(
                                        <DatePicker
                                            className="ant-calendar-picker_time"
                                            format="YYYY-MM-DD"
                                            placeholder='回访日期'
                                        />
                                    )}
                                </FormItem>
                            </Col>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="回访方式">
                                    {getFieldDecorator('returnVisitType', {
                                    initialValue: dataBind(this.state.dataModel.returnVisitType),
                                    rules: [{
                                        required: true, message: '请选择回访方式!',
                                    }]
                                    })(
                                    <Select>
                                        <Option value="">--请选择--</Option>
                                        {this.props.return_visit_type.map((item, index) => {
                                            return <Option value={item.value} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout24}
                                    label="回访内容"
                                >
                                    {getFieldDecorator('returnVisitContent', {
                                        initialValue: '',
                                    })(
                                        <TextArea rows={4} />
                                        )}
                                </FormItem>
                            </Col>
                            
                        </Row>
                    </Form>
                );
                break;
            
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <div>
                <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_editModeView}
                    <div className="dv_split"></div>
                </ContentBox>
                <div className="dv_split"></div>
                {
                    this.state.returnSivitList.length ? <div style={{padding:'0 20px',border:'1px solid #c8c8c8'}}>
                        <Form>
                            {
                                this.state.returnSivitList.map((item) => {
                                    return <Row gutter={24}>
                                        <p style={{lineHeight:'50px',background:'yellow'}}>{timestampToTime(item.returnVisitDate)}&nbsp;&nbsp;{item.createUserName}&nbsp;&nbsp;{item.visitType}&nbsp;&nbsp;【回访日期+回访人+回访方式】&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{this.props.userId == item.createUid ? <a href='javascript:;' onClick={() => { this.onReturnVisitDetal(item); }}>删除此条</a> : ''}</p>
                                        <Col span={24} style={{paddingTop:10}}>
                                            <FormItem
                                                {...searchFormItemLayout24}
                                                label="回访要点"
                                            >
                                                { item.returnVisitContent }
                                            </FormItem>
                                        </Col>
                                    </Row>
                                })
                            }
                            
                        </Form>
                        
                    </div>
                : ''
                }
                
            </div>
        );
    }
}

const WrappedView = Form.create()(ReturnView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    let { userId } = state.auth.currentUser.user;
    return { Dictionarys, userId };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        returnVisitSelectReturnSivit: bindActionCreators(returnVisitSelectReturnSivit, dispatch),
        returnVisitStudentDel: bindActionCreators(returnVisitStudentDel, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
